"""Integration regressions. Run ONLY against a disposable PostgreSQL database.

See DEPLOY.md for the isolated Compose project; no test dependency is needed.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
import json
import os
from threading import Barrier
import unittest
from unittest.mock import patch

from sqlalchemy import text

from app_factory import create_app
from extensions import db


@unittest.skipUnless(os.getenv("MONITORA_TEST_DATABASE") == "1", "Disposable test DB required")
class BackendIntegrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.testing = True
        cls.base = "https://localhost"
        cls.number = 100000
        cls.codes = json.loads(os.environ["PROFESSOR_CODES_JSON"])
        with cls.app.app_context():
            # The explicit opt-in above and isolated Compose network are mandatory.
            db.session.execute(text("TRUNCATE bookings, slots, users RESTART IDENTITY CASCADE"))
            db.session.commit()
        cls.monitor, cls.monitor_csrf = cls.register("monitor", offering_id="off-ihc")
        cls.colleague, cls.colleague_csrf = cls.register("monitor", offering_id="off-ihc")
        cls.other, cls.other_csrf = cls.register("monitor", offering_id="off-es")
        cls.student, cls.student_csrf = cls.register("student", course="ES1A")

    @classmethod
    def register(cls, role="student", **extra):
        cls.number += 1
        client = cls.app.test_client()
        body = dict(role=role, name="Pessoa de Teste", ra=str(cls.number),
                    email=f"teste{cls.number}@example.org", password="teste-seguro-123")
        body.update(extra)
        if role == "monitor":
            body["professor_code"] = cls.codes[body["offering_id"]]
        response = client.post("/api/auth/register", json=body, base_url=cls.base)
        if response.status_code != 201:
            raise AssertionError(response.get_json())
        return client, response.json["csrf_token"]

    def request(self, client, method, path, csrf=None, **kwargs):
        return client.open(path, method=method, base_url=self.base,
                           headers={"X-CSRF-TOKEN": csrf} if csrf else {}, **kwargs)

    def slot(self):
        type(self).number += 1
        day = date.today() + timedelta(days=2 + self.number % 300)
        response = self.request(self.monitor, "POST", "/api/slots", self.monitor_csrf,
                                json=dict(date=day.isoformat(), time="14:00 - 14:40",
                                          capacity=3, professor_code=self.codes["off-ihc"]))
        self.assertEqual(response.status_code, 201, response.json)
        return response.json["slot"]

    def test_cookie_csrf_and_cors(self):
        client, csrf = self.register(course="Engenharia de Software - Turma Noturna")
        me = self.request(client, "GET", "/api/auth/me")
        self.assertEqual(me.json["csrf_token"], csrf)
        self.assertEqual(me.headers["Cache-Control"], "no-store")
        login = client.post("/api/auth/login", json={"identifier": me.json["user"]["ra"],
                            "password": "teste-seguro-123"}, base_url=self.base)
        cookie = next(c for c in login.headers.getlist("Set-Cookie") if c.startswith("access_token_cookie="))
        for flag in ("Secure", "HttpOnly", "SameSite=None"):
            self.assertIn(flag, cookie)
        self.assertNotIn("access_token", login.json)
        self.assertEqual(self.request(client, "POST", "/api/auth/logout").status_code, 403)
        self.assertEqual(self.request(client, "POST", "/api/auth/logout", "wrong").status_code, 403)
        self.assertEqual(self.request(client, "POST", "/api/auth/logout", login.json["csrf_token"]).status_code, 200)
        with patch.dict(os.environ, {"CORS_ORIGINS": " https://julianosdev.github.io , http://localhost:5500, "}):
            app = create_app()
        for origin in ("https://julianosdev.github.io", "http://localhost:5500"):
            preflight = app.test_client().options("/api/slots/1", headers={
                "Origin": origin, "Access-Control-Request-Method": "DELETE",
                "Access-Control-Request-Headers": "X-CSRF-TOKEN"})
            self.assertEqual(preflight.headers.get("Access-Control-Allow-Origin"), origin)
            self.assertEqual(preflight.headers.get("Access-Control-Allow-Credentials"), "true")
        rejected = app.test_client().get("/api/health", headers={"Origin": "https://evil.example"})
        self.assertNotIn("Access-Control-Allow-Origin", rejected.headers)

    def test_courses(self):
        for course in ("ES1B", "S1", "X" * 80):
            client, _ = self.register(course=course)
            self.assertEqual(self.request(client, "GET", "/api/auth/me").json["user"]["course"], course)
        for course in (None, "  ", "X" * 81, 123, {"name": "ES1A"}):
            response = self.app.test_client().post("/api/auth/register", base_url=self.base, json={
                "role": "student", "name": "Pessoa Teste", "ra": "990000",
                "email": "invalid@example.org", "password": "teste1234", "course": course})
            self.assertEqual(response.status_code, 422, response.json)
            self.assertIn("course", response.json["fields"])

    def test_delete_authorization_and_csrf(self):
        slot = self.slot()
        path = f"/api/slots/{slot['id']}"
        self.assertEqual(self.request(self.app.test_client(), "DELETE", path).status_code, 401)
        self.assertEqual(self.request(self.student, "DELETE", path, self.student_csrf).status_code, 403)
        self.assertEqual(self.request(self.monitor, "DELETE", path).status_code, 403)
        self.assertEqual(self.request(self.monitor, "DELETE", path, "wrong").status_code, 403)
        self.assertEqual(self.request(self.other, "DELETE", path, self.other_csrf).status_code, 403)
        self.assertEqual(self.request(self.colleague, "DELETE", path, self.colleague_csrf).status_code, 204)
        self.assertEqual(self.request(self.monitor, "DELETE", path, self.monitor_csrf).status_code, 404)

    def test_delete_preserves_history_and_allows_republication(self):
        slot = self.slot()
        booking = self.request(self.student, "POST", "/api/schedules", self.student_csrf,
                               json={"slot_id": slot["id"], "topic": "Duvida de teste"})
        self.assertEqual(booking.status_code, 201, booking.json)
        path = f"/api/slots/{slot['id']}"
        self.assertEqual(self.request(self.monitor, "DELETE", path, self.monitor_csrf).status_code, 409)
        booking_id = booking.json["schedule"]["id"]
        cancel = self.request(self.student, "PATCH", f"/api/schedules/{booking_id}/status",
                              self.student_csrf, json={"status": "Cancelado"})
        self.assertEqual(cancel.status_code, 200, cancel.json)
        self.assertEqual(self.request(self.monitor, "DELETE", path, self.monitor_csrf).status_code, 204)
        listed = self.request(self.student, "GET", "/api/slots").json["slots"]
        self.assertNotIn(slot["id"], [s["id"] for s in listed])
        history = self.request(self.student, "GET", "/api/schedules").json["schedules"]
        self.assertIn(booking_id, [b["id"] for b in history])
        undo = self.request(self.student, "PATCH", f"/api/schedules/{booking_id}/status",
                            self.student_csrf, json={"status": "Confirmado"})
        self.assertEqual(undo.status_code, 409, undo.json)
        new_booking = self.request(self.student, "POST", "/api/schedules", self.student_csrf,
                                  json={"slot_id": slot["id"], "topic": "Duvida de teste"})
        self.assertEqual(new_booking.status_code, 404)
        republish = self.request(self.monitor, "POST", "/api/slots", self.monitor_csrf,
                                 json=dict(date=slot["date"], time=slot["time"], capacity=3,
                                           professor_code=self.codes["off-ihc"]))
        self.assertEqual(republish.status_code, 201, republish.json)
        self.assertNotEqual(republish.json["slot"]["id"], slot["id"])
        offering = self.request(self.student, "GET", "/api/offerings").json["offerings"]
        with self.app.app_context():
            expected = db.session.execute(text("SELECT coalesce(sum(s.capacity - "
                "(SELECT count(*) FROM bookings b WHERE b.slot_id=s.id AND b.status='Confirmado')),0) "
                "FROM slots s WHERE s.offering_id='off-ihc' AND s.deleted_at IS NULL")).scalar()
        ihc = next(o for o in offering if o["id"] == "off-ihc")
        self.assertEqual(ihc["remaining_total"], expected)

    def test_concurrent_booking_and_deletion(self):
        for _ in range(4):
            slot = self.slot()
            barrier = Barrier(2)

            def book():
                barrier.wait(timeout=10)
                return self.request(self.student, "POST", "/api/schedules", self.student_csrf,
                                    json={"slot_id": slot["id"], "topic": "Teste concorrente"}).status_code

            def delete():
                barrier.wait(timeout=10)
                return self.request(self.monitor, "DELETE", f"/api/slots/{slot['id']}",
                                    self.monitor_csrf).status_code

            with ThreadPoolExecutor(max_workers=2) as executor:
                booking = executor.submit(book)
                deletion = executor.submit(delete)
                self.assertIn((booking.result(), deletion.result()), {(201, 409), (404, 204)})

    def test_google_oauth_and_providers(self):
        with patch.dict(os.environ, {"GOOGLE_CLIENT_ID": "test-google-client.apps.googleusercontent.com"}):
            app = create_app()
            app.testing = True
        client = app.test_client()
        providers = client.get("/api/auth/providers", base_url=self.base)
        self.assertEqual(providers.status_code, 200)
        self.assertTrue(providers.json["google"]["enabled"])
        self.assertEqual(providers.json["google"]["client_id"], "test-google-client.apps.googleusercontent.com")
        self.assertFalse(providers.json["gennera"]["enabled"])

        gennera = client.post("/api/auth/gennera", json={}, base_url=self.base)
        self.assertEqual(gennera.status_code, 503)

        fake_google_payload = {
            "iss": "https://accounts.google.com",
            "sub": "google-sub-999111",
            "email": "juliano.google@example.org",
            "email_verified": True,
            "name": "Juliano Google",
            "picture": "https://lh3.googleusercontent.com/a/example",
        }
        with patch("api.auth.services.google_id_token.verify_oauth2_token", return_value=fake_google_payload):
            first = client.post("/api/auth/google", json={"credential": "fake-jwt"}, base_url=self.base)
            self.assertEqual(first.status_code, 200, first.json)
            self.assertTrue(first.json["needs_onboarding"])
            onboarding_token = first.json["onboarding_token"]

            complete = client.post(
                "/api/auth/google/complete",
                json={
                    "onboarding_token": onboarding_token,
                    "role": "student",
                    "name": "Juliano Google",
                    "ra": "7788991",
                    "course": "Eng. Software · 1º A",
                },
                base_url=self.base,
            )
            self.assertEqual(complete.status_code, 201, complete.json)
            self.assertEqual(complete.json["user"]["avatar_url"], fake_google_payload["picture"])
            self.assertTrue(complete.json["user"]["has_google"])

            # Segundo login com o mesmo Google entra direto sem onboarding
            again_client = app.test_client()
            second = again_client.post("/api/auth/google", json={"credential": "fake-jwt"}, base_url=self.base)
            self.assertEqual(second.status_code, 200, second.json)
            self.assertEqual(second.json["user"]["ra"], "7788991")
            self.assertIn("csrf_token", second.json)


if __name__ == "__main__":
    unittest.main()
