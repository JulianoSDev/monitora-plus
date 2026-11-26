"""Production WSGI entrypoint for running Monitora+ (API + Frontend) natively on Windows."""
import os
from waitress import serve
from app_factory import create_app


def main():
    app = create_app()
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    threads = int(os.getenv("WAITRESS_THREADS", "8"))
    print(f"Monitora+ WSGI (Waitress) listening on http://{host}:{port} (threads={threads})", flush=True)
    serve(app, host=host, port=port, threads=threads, ident="MonitoraPlus")


if __name__ == "__main__":
    main()
