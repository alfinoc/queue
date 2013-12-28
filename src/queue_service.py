import os
import urlparse
from werkzeug.wrappers import Request, Response
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import HTTPException, NotFound, BadRequest
from werkzeug.wsgi import SharedDataMiddleware
from werkzeug.utils import redirect
from jinja2 import Environment, FileSystemLoader

from search_engine import SearchEngine
from search_engine import PitchforkParser

class QueueService(object):
	def __init__(self):
		template_path = os.path.join(os.path.dirname(__file__), 'templates')
		self.jinja_env = Environment(loader=FileSystemLoader(template_path),
									autoescape=True)
		self.url_map = Map([
			Rule('/', endpoint='all_search_results'),
			Rule('/lists', endpoint='lists'),
			Rule('/<pattern>', endpoint='otherwise')
			])

	def dispatch_request(self, request):
		adapter = self.url_map.bind_to_environ(request.environ)
		try:
			endpoint, values = adapter.match()
			return getattr(self, 'get_' + endpoint)(request, **values)
		except HTTPException, e:
			return e

	def wsgi_app(self, environ, start_response):
		request = Request(environ);
		response = self.dispatch_request(request);
		return response(environ, start_response);

	def __call__(self, environ, start_response):
		return self.wsgi_app(environ, start_response)

	def render_template(self, template_name, **context):
		t = self.jinja_env.get_template(template_name)
		return Response(t.render(context), mimetype='text/plain')

	# get search results for a given query, provided in the request arguments
	# as 'q'. if this parameter is not set, raises as BadRequest error.
	def get_all_search_results(self, request, **values):
		if not request.args.has_key('q'):
			raise BadRequest('please provide a search query \'q\'')
		engine = SearchEngine()
		try:
			query = request.args['q']
			limit = int(request.args['limit']) if request.args.has_key('limit') else 10
			service = request.args['service'] if request.args.has_key('service') else 'all'
		except:
			return BadRequest('error parsing request. make sure limit is an integer')

		sc_res = []
		yt_res = []
		# query each of the services provided by the engine
		if service == 'all' or service == 'soundcloud':
			sc_res = engine.soundcloud_query(query, limit)
		if service == 'all' or service == 'youtube':
			yt_res = engine.youtube_query(query, limit)
		return self.render_template('results.txt', results=sc_res + yt_res)

	def get_lists(self, request, **values):
		if request.args.has_key('pitchfork'):
			try:
				limit = int(request.args['limit']) if request.args.has_key('limit') else 10
			except:
				return BadRequest('error parsing limit parameter. provide an integer.')
			pp = PitchforkParser()
			results = pp.get_link_list(limit)
			return self.render_template('results.txt', results=results)
		else:
			return BadRequest('provide some music provider (like pitchfork) as a parameter.')

	def get_otherwise(self, request, **values):
		return Response('What you doing?', mimetype='text/plain')






