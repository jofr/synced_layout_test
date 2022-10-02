Test using CRDTs to model a graphical layout and synchronize edits between different browser windows (using a central server for now). Example video showing the current state below. To try it out clone the repository and

```bash
npm i # install dependencies
npx parcel index.html # to run parcel and start a dev server on port 1234
node test_server.js # to run the test server for synchronization
```

then open `http://localhost:1234` in a browser and try it out (synchronize between several browser windows by copying document id, see videos below).

https://user-images.githubusercontent.com/1087312/193462995-dd63fd1d-4a7b-412f-8016-1bd7b01decf9.mov
