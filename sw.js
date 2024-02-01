import fs from './install-files/os/fs.js';


let details;
self.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.name === "details") {
    details = data.payload;
  }
})

const getDetails = () => new Promise(res => {
  if (details) return res(details) 
  setTimeout(() => {
    res(getDetails())
  }, 10);
})

const getFile = async (pathname) => {
  const file = await fs.readFile(pathname)
  return file
}


self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  const pathname = new URL(url).pathname;
  if (!url.startsWith(location.origin)) return;

  getDetails().then((details) => {
    if (details.updating) return
    fs.init();
    
    if (!pathname.startsWith(details.config.BASEPATH + "hdd")) return;
  
    event.respondWith((async () => {
      const blob = await getFile(pathname.substring(3 + details.config.BASEPATH.length))
      if (!blob) {
        return new Response("Not found", {status: 404})
      }
      return new Response(blob)
    })())
  })
})