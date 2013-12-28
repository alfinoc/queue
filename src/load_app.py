import os
from werkzeug.wsgi import SharedDataMiddleware

from queue_service import QueueService

def create_app(with_static=True):
   app = QueueService()
   if with_static:
      app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
            '/static':  os.path.join(os.path.dirname(__file__), 'static')
      })
   return app

if __name__ == '__main__':
   from werkzeug.serving import run_simple
   app = create_app()
   run_simple('localhost', 5000, app, use_debugger=True, use_reloader=True)