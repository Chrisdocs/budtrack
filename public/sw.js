const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const FILES_TO_CACHE = [
    '/js/idb.js',
    '/js/index.js',
    '/index.html',
    '/css/styles.css'
]
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
        )
    });
    
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
            return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
    
        return Promise.all(
            keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
                console.log('deleting cache : ' + keyList[i]);
                return caches.delete(keyList[i]);
            }
            })
        );
        })
    );
});

// self.addEventListener('fetch', function (e) {
//     console.log('fetch request : ' + e.request.url)
//     e.respondWith(
//         caches.match(e.request).then(function (request) {
//             if (request) { // if cache is available, respond with cache
//                 console.log('responding with cache : ' + e.request.url)
//                 return request
//             } else { // if there are no cache, try fetching request
//                 console.log('file is not cached, fetching : ' + e.request.url)
//                 return fetch(e.request)
//             }

//             // You can omit if/else for console.log & put one line below like this too.
//             // return request || fetch(e.request)
//         })
//     )
// })

self.addEventListener('fetch', event => {
    // Let the browser do its default thing
    // for non-GET requests.
    if (event.request.method != 'GET') return;

    // Prevent the default, and handle the request ourselves.
    event.respondWith(async function () {
        // Try to get the response from a cache.
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            // If we found a match in the cache, return it, but also
            // update the entry in the cache in the background.
            event.waitUntil(cache.add(event.request));
            return cachedResponse;
        }

        // If we didn't find a match in the cache, use the network.
        return fetch(event.request);
    }());
});