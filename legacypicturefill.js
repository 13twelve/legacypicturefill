/*! legacypicturefill - v1.0.7 - 2016-12-08
 * https://github.com/area17/legacypicturefill
 * Copyright (c) 2016
 * License: MIT
 * Author: Mike Byrne @13twelve https://github.com/13twelve
 */
(function(document) {
  // place holders
  var i, j, pictures, imgs, sources, timer, redraw;
  /**
   * Returns the middle value src from a srcset
   * @private
   * @param {String} str a srcset.
   * @returns {String} the src.
   */
  function returnMiddleSourceSetValue(str) {
    if (str) {
      // a regex to strip white space
      var re = new RegExp('^\\s+|\\s+$','gm');
      // split the string into an array
      var arr = str.split(',');
      if (arr.length > 0) {
        // pick the middle value, stripe white space, split again, pick first value, strip white space, return
        return arr[Math.floor(arr.length/2)].replace(re,'').split(' ')[0].replace(re,'');
      } else {
        return false;
      }
    }
    return false;
  }

  /**
   * Keeps checking if document.readyState does not contain 'in' (loading)
   * if it doesn't, runs the legacypicturefill func, otherwise checks again
   * @private
   */
  function domReady() {
    if (/in/.test(document.readyState)) {
      setTimeout(domReady,9);
    } else {
      // IE9 and 10 can fire 'document.readyState === interaction' before its parsed the document
      // hackily giving it 50ms to finish parsing
      setTimeout(function(){
        legacypicturefill();
      },50);
    }
  }

  /**
   * FF < 3.6 shim for domready check
   * Those early FF don't have the document.readyState, as it comes from IE
   * This loop checks if readyState exists or not and hackily polyfills
   * @private
   */
  function oldFFdomReadyShim() {
    if (!document.readyState && document.addEventListener) {
      if (document.body) {
        // document body has loaded but there is a chance the body isn't complete
        // lets hackily give it 500ms to do this..
        setTimeout(function(){
          document.readyState = 'complete';
        },500);
      } else {
        // still loading, try again
        setTimeout(oldFFdomReadyShim,9);
      }
    }
  }

  /**
   * Force repaint on load of image for better resizing
   * hiding and showing the image forces the repaint
   * @private
   */
  function repaint() {
    this.style.display = 'none';
    this.style.display = '';
  }

  /**
   * adds the src, an onload event to force a repaint and removes attributes
   * @param {Node} the DOM node to update
   * @param {Src} str a src
   */
  function addSrc(img, src) {
    if (img && src) {
      // repaint on load
      img.onload = repaint;
      // set src, with a cache buster to force the repaint
      img.src = src + '?' + new Date().getTime();
      // remove srcset and sizes in case they somehow foul up the display sizes
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.removeAttribute('data-srcset');
      img.removeAttribute('data-src');
    }
  }

  /**
   * Update image - tries to grab data-srcset, srcset or data-src
   * to use to add a src to the image
   * @private
   * @param {Node} the image to update
   */
  function updateImg(img) {
    if (img) {
      var srcset = img.getAttribute('data-srcset') || img.getAttribute('srcset');
      var dataSrc = img.getAttribute('data-src');
      if (srcset) {
        addSrc(img, returnMiddleSourceSetValue(srcset));
      } else if (dataSrc) {
        addSrc(img, dataSrc);
      } else {
        // no data-srcset, no srcset and no data-src
        // hopefully the image has a src and displays something...
      }
    }
  }

  /**
   * If not sources are found in a <picture>, we look to any img's there
   * @private
   * @param {Node} the picture to look inside
   */
  function findImagesInPicture(picture) {
    // grab images inside the picture
    imgs = picture.getElementsByTagName('img');
    for(j = 0; j < imgs.length; j++){
      if (j === 0) {
        updateImg(imgs[j]);
      } else {
        imgs[j].parentNode.removeChild(imgs[j]);
      }
    }
  }

  /**
   * Updates img srcs, checks pictures for img with srcs or adds img to pictures
   * @public
   * @param {Node} context which element you want to check.
   */
  function legacypicturefill(context) {
    context = context || document;
    // grab pictures and loop
    pictures = context.getElementsByTagName('picture');
    for(i = 0; i < pictures.length; i++){
      // grab sources
      sources = pictures[i].getElementsByTagName('source');
      if (sources) {
        // lets discount any sources that are obviously going to upset legacy browsers, such as SVG
        for(j = 0; j < sources.length; j++) {
          if (sources[j].getAttribute('type') && sources[j].getAttribute('type') === 'image/svg+xml') {
            sources[j].parentNode.removeChild(sources[j]);
          }
        }
        // do we have any sources left?
        sources = pictures[i].getElementsByTagName('source');
        if (sources && sources.length > 0) {
          var midSource = sources[Math.floor(sources.length/2)];
          var src = returnMiddleSourceSetValue(midSource.getAttribute('data-srcset') || midSource.getAttribute('srcset'));
          if (src) {
            // make an image, give it a src, clear the picture, append the new image
            var img = document.createElement('img');
            addSrc(img, src);
            pictures[i].innerHTML = '';
            pictures[i].appendChild(img);
          } else {
            // no src, lets try any img in the picture
            findImagesInPicture(pictures[i]);
          }
        } else {
          // no sources, lets try any img in the picture
          findImagesInPicture(pictures[i]);
        }
      }
    }

    // loop images, update the src, or leave with the existing source if that fails
    imgs = context.getElementsByTagName('img');
    for(i = 0; i < imgs.length; i++) {
      updateImg(imgs[i]);
    }
  }

  // expose
  window.legacypicturefill = legacypicturefill;

  // force a repaint of the images on page load (so IE6 can do height auto properly..)
  window.onload = function() {
    imgs = null;
    imgs = document.getElementsByTagName('img');
    for(i = 0; i < imgs.length; i++){
      imgs[i].style.display = 'none';
      imgs[i].style.display = '';
    }
  };

  // go go go
  oldFFdomReadyShim();
  domReady();

})(document);
