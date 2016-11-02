/*! legacypicturefill - v1.0.5 - 2016-11-02
 * https://github.com/13twelve/legacypicturefill
 * Copyright (c) 2016
 * License: MIT
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
        legacypicturefill(document);
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
          document.readyState = "complete";
        },500);
      } else {
        // still loading, try again
        setTimeout(oldFFdomReadyShim,9);
      }
    }
  }

  /**
   * Force repaint on load of image for better resizing
   * @private
   */
  function repaint() {
    this.style.display = 'none';
    this.style.display = '';
  }

  /**
   * Update image
   * @private
   */
  function update(img,src) {
    if (src) {
      // hide the image, to force a repaint on load - to size properly
      img.onload = repaint;
      // set src
      img.src = src + "?" + new Date().getTime();
      // remove srcset and sizes in case they somehow foul up the display sizes
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    }
  }

  /**
   * Updates img srcs, checks pictures for img with srcs or adds img to pictures
   * @public
   * @param {Node} context which element you want to check.
   */
  function legacypicturefill(context) {
    // grab pictures and loop
    pictures = context.getElementsByTagName('picture');
    for(i = 0; i < pictures.length; i++){
      // grab images inside the picture
      imgs = pictures[i].getElementsByTagName('img');
      for(j = 0; j < imgs.length; j++){
        // if they don't have a src or a srcset, remove them
        if (!imgs[j].src && !imgs[j].srcset) {
          imgs[j].parentNode.removeChild(imgs[j]);
        }
      }
      // grab images again
      imgs = pictures[i].getElementsByTagName('img');
      // if none left, lets try adding one, but this time with a src
      if (imgs.length === 0) {
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
            var src = returnMiddleSourceSetValue(sources[Math.floor(sources.length/2)].getAttribute('srcset'));
            if (src) {
              // make an image, give it a src, clear the picture, append the new image
              var img = document.createElement('img');
              update(img,src);
              pictures[i].innerHTML = '';
              pictures[i].appendChild(img);
            }
          } else {
            // no sources, we're stuck as we have nothing to choose from..
          }
        } else {
          // no sources, we're stuck as we have nothing to choose from..
        }
      }
    }

    // loop images, update the src, or leave with the existing source if that fails
    imgs = context.getElementsByTagName('img');
    for(i = 0; i < imgs.length; i++){
      var srcset = imgs[i].getAttribute('srcset');
      if (srcset) {
        update(imgs[i], returnMiddleSourceSetValue(srcset));
      }
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
