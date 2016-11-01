/*! legacypicturefill - v1.0.0 - 2016-11-01
 * https://github.com/13twelve/legacypicturefill
 * Copyright (c) 2016
 * License: MIT
 */
(function(document) {
  // place holders
  var i, j, pictures, imgs, sources, timer;

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
      // pick the middle value, stripe white space, split again, pick first value, strip white space, return
      return arr[Math.floor(arr.length/2)].replace(re,'').split(' ')[0].replace(re,'');
    }
    return false;
  }

  /**
   * Keeps checking if document.body exists in order to run the main function
   * @private
   */
  function waitForDocumentBody() {
    if (document.body) {
      legacypicturefill(document);
    } else {
      setTimeout(waitForDocumentBody,200);
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
          if (sources) {
            // generate a src from the srcset of the source
            var src = returnMiddleSourceSetValue(sources[Math.floor(sources.length/2)].getAttribute('srcset'));
            if (src) {
              // make an image, give it a src, clear the picture, append the new image
              var img = document.createElement('img');
              img.src = src;
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
      // hide the image, to force a repaint (required so IE6 will size properly)
      imgs[i].style.display = 'none';
      // update src
      imgs[i].src = returnMiddleSourceSetValue(imgs[i].getAttribute('srcset')) || imgs[i].src;
      // remove srcset and sizes in case they somehow foul up the display sizes
      imgs[i].removeAttribute('srcset');
      imgs[i].removeAttribute('sizes');
      // complete the repaint
      imgs[i].style.display = '';
    }
  }

  // expose
  window.legacypicturefill = legacypicturefill;

  // go go go
  setTimeout(waitForDocumentBody,200);

})(document);
