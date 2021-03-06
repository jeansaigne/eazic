'use strict';

////Youtubesearches service used to communicate Youtubesearches REST endpoints
//angular.module('youtubesearches').factory('Youtubesearches', ['$resource',
//	function($resource) {
//		return $resource('api/youtubesearches/:youtubesearchId', { youtubesearchId: '@_id'
//		}, {
//			update: {
//				method: 'PUT'
//			}
//		});
//	}
//]);

angular.module('youtubesearches').factory('YoutubeSearch', ['$resource',
	function($resource) {
		return $resource('api/search/youtube', {}, {
			search : {
				method : 'POST'
			}
		});
	}
]);
