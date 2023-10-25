import { useState, useEffect, useRef } from "react";
import Api from "./api/api";
import "../reference/styles.css";

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

function App() {
  const gridRef = useRef();
  const [photoList, setPhotoList] = useState();
  const [loadState, setLoadState] = useState(true);
  const [page, setPage] = useState(1);
  const numOfImages = 12;

  const options = {
    // root: null,
    // rootMargin: "600px",
    threshold: 1,
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      const photos = await Api.getPhotos(page, numOfImages);
      setPhotoList(photos);
    };
    fetchPhotos();
    setLoadState(false);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    async function fetchNext() {
      setLoadState(true);
      const newPhotos = await Api.getNextPhotos(photoList.next);
      const photoSet = new Set();
      photoList.res.forEach(photo => photoSet.add(photo));
      newPhotos.res.forEach(photo => photoSet.add(photo));
      setPhotoList({
        res: [...photoSet],
        next: newPhotos.next,
      });
    }
    try {
      if (photoList?.next) fetchNext();
    } catch (e) {
      if (!isCancelled) {
        throw Error;
      }
    }
    return () => {
      isCancelled = true;
    };
  }, [page]);

  useEffect(() => {
    const lastPhotoObserver = new IntersectionObserver(entries => {
      const last = entries[0];
      if (last.isIntersecting) {
        setPage(page => page + 1);
        lastPhotoObserver.unobserve(last.target);
        lastPhotoObserver.observe(
          gridRef.current.children[gridRef.current.children.length - 1]
        );
      }
      if (loadState) setLoadState(false);
    }, options);
    if (photoList) {
      lastPhotoObserver.observe(
        gridRef.current.children[gridRef.current.children.length - 1]
      );
    }

    return () => {
      if (photoList)
        lastPhotoObserver.unobserve(
          gridRef.current.children[gridRef.current.children.length - 1]
        );
    };
  }, [options]);

  return (
    <>
      <div className="grid" ref={gridRef}>
        {photoList && photoList?.res.map(p => <img key={p.id} src={p.url} />)}
        {loadState &&
          Array(numOfImages)
            .fill()
            .map((x, i) => i)
            .map(l => (
              <div key={`skeleton-${l}`} className="skeleton">
                Loading...
              </div>
            ))}
      </div>
    </>
  );
}

export default App;
