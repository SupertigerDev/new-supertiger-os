import fs from './fs.js';



const getFile = async (pathname) => {
  const file = await fs.readFile(pathname)
  return file
}

self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  const pathname = new URL(url).pathname;

 
  if (!url.startsWith(location.origin)) return;
  
  
  const basePath = "/new-supertiger-os"
  // const basePath = ""
  
  console.log({
    1: pathname.substring(4 + basePath.length), 
    2: pathname, 
    3: pathname.startsWith(basePath + "/hdd")
  })
  
  if (!pathname.startsWith(basePath + "/hdd")) return;
  
  event.respondWith((async () => {
      const blob = await getFile(pathname.substring(4 + basePath.length))
      if (!blob) {
        return new Response("Not found", {status: 404})
      }
      return new Response(blob)
    })())
})