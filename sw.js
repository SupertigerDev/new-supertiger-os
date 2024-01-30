import { getFileStorage } from './idb-file-storage.js';


let hdd;

const getFile = async (pathname) => {
  if (!hdd) {
    hdd = await getFileStorage({name: "hdd"});
  }
  return hdd.get(pathname)
}

self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  const pathname = new URL(url).pathname;

  if (!url.startsWith(location.origin)) return;

  if (!pathname.startsWith("/hdd")) return;
  
  event.respondWith( (async () => {
      const blob = await getFile(pathname.substring(5))
      if (!blob) {
        return new Response("Not found", {status: 404})
      }
      return new Response(blob)
    })())
})