from werkzeug.wrappers import Request, Response
import soundcloud
import gdata.youtube
import gdata.youtube.service
import urllib2
import re

# provides basic search utilities, essentially acting as a wrapper for various
# external APIs 
class SearchEngine(object):
   def __init__(self):
      self.client = soundcloud.Client(client_id='6f8f25b3601ce9366071e6b0a42a4573')
      self.yt_service = gdata.youtube.service.YouTubeService()

   # queries the initialized soundcloud service with query 'search_terms',
   # limiting results to 'num_queries'
   # returns a list of SearchResult objects with initialized fields
   def soundcloud_query(self, search_terms, num_queries=10):
      response = self.client.get('/tracks', q=search_terms, limit=num_queries)
      results = []
      for res in response:
         sr = SearchResult()
         sr.convert_sc(res)
         results.append(sr)
      return results

   # queries the initialized youtube service with query 'search_terms',
   # limiting results to 'num_queries'
   # returns a list of SearchResult objects with initialized fields
   def youtube_query(self, search_terms, num_queries=10):
      query = gdata.youtube.service.YouTubeVideoQuery()
      query.vq = search_terms
      query.orderby = 'viewCount'
      query.racy = 'include'
      query.max_results = num_queries
      feed = self.yt_service.YouTubeQuery(query)
      results = []
      for res in feed.entry:
         sr = SearchResult()
         sr.convert_yt(res)
         results.append(sr)
      return results

   def lookup_sc_id(self, id):
      search_terms = "hey ya"
      num_queries = 123
      resource = self.client.get('/tracks/' + str(id))
      results = []
      sr = SearchResult()
      sr.convert_sc(resource)
      return sr

   def lookup_yt_id(self, id):
      xml = self.yt_service.GetYouTubeVideoEntry(video_id=id)
      

# represents a result from a search query, and can be constructed
# using convert_<service acronym> methods
# contains fields for:
#  title: the title of the media, as provided by the service
#  embed_url: either a url to a stream or to an embedded player
#  duration: the duration of the media
#  artwork_url: a thumbnail for the media
#  permalink_url: a url to a webpage page with the media
#  service: the service from which the result comes
class SearchResult(object):
   # converts from a result object
   def convert_sc(self, res):
      self.title = res.title
      self.embed_url = res.stream_url if res.streamable else 'null'
      self.duration = res.duration
      self.artwork_url = res.artwork_url
      self.permalink_url = res.permalink_url
      self.sc_id = res.id
      self.service = 'soundcloud'

   # converts from a feed.entry array
   def convert_yt(self, res):
      self.title = res.media.title.text.decode("utf8")
      self.embed_url = res.GetSwfUrl()
      # normalize to milliseconds
      self.duration = str(int(res.media.duration.seconds) * 1000)
      self.artwork_url = res.media.thumbnail[0].url
      self.permalink_url = res.media.player.url
      self.sc_id = 'null'
      self.service = 'youtube'

# provides the ability to search through pages on pitchfork for soundcloud and
# youtube links
class PitchforkParser(object):
   def __init__(self):
      self.link = 'http://pitchfork.com/reviews/tracks/2'

   # returns a list of search results, each corresponding to the links provided
   # on a given page, in the order they appear there.
   def get_link_list(self, limit=10):
      contents = urllib2.urlopen(self.link).read()
      regex = 'data-sc-track-id=\"[0-9]{3,}\"|\/v\/.{3,15}\?' #'data-sc-track-id=\"[0-9]{3,}\"'
      fetched = re.findall(regex, contents)
      engine = SearchEngine()

      results = []
      seen_ids = []
      for res in fetched:
         sr = SearchResult()
         if res[0] == 'd':
            id = res[(res.find('\"') + 1):res.rfind('\"')]
            sr = engine.lookup_sc_id(id)
         elif res[1] == 'v':
            id = res[3:len(res) - 1]
            sr = engine.lookup_yt_id(id)
         else:
            continue
         if not id in seen_ids:
            results.append(sr)
         seen_ids.append(id)
      return results









