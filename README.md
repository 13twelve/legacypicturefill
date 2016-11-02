# legacypicturefill

v1.0.5 / 2016-11-02

Arbitrarily fills an image src with the middle value in a srcset and adds an image to picture elements, using and arbitrary src from the sources.

## Why don't you just use picturefill ?

I love [picturefill](https://github.com/scottjehl/picturefill) and the fact it has such a wide browser support. But, maybe you want browsers it doesn't support to display images too.

By default with `srcset`/`<picture>` we don't always specify an incredibly useful `src` for default. Sometimes we leave `src` empty, sometimes we make it a tiny [200 byte preview photo](https://code.facebook.com/posts/991252547593574/the-technology-behind-preview-photos/). These are totally fine, and advisable, for responsive images - especially as we don't want a large extra request in browsers that aren't true `srcset` supporters.

This leaves a problem for really old browsers in that they'll likely see no image at all. And they say a picture is worth a thousand words.

Lets imagine you are in IE6, you have no choice about it, and you are viewing products on a website. Seeing no images, tiny images or blurred images isn't going to help. Step in legacypicturefill to arbitrarily update the src to something more useful.

## How I'm using this

In the head of my documents I'm inlining small piece of JavaScript:

```javascript
(function(d) {
  var w = window,
      h = d.getElementsByTagName('head')[0],
      s = d.createElement('script');

  var browserSpec = (typeof d.querySelectorAll && 'addEventListener' in w && w.history.pushState && d.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1')) ? 'html5' : 'html4';

  if(browserSpec === 'html4') {
    s.src = '//legacypicturefill.s3.amazonaws.com/legacypicturefill.min.js';
  } else {
    s.src = '//cdnjs.cloudflare.com/ajax/libs/picturefill/3.0.2/picturefill.min.js';
  }

  h.appendChild(s);

})(document);
```

This is to decide on the browser's spec, basically my version of the BBC's ['cutting the mustard test'](http://responsivenews.co.uk/post/18948466399/cutting-the-mustard). If the browser is deemed to be a HTML4 browser I load legacypicturefill and if its a HTML5 browser I load picturefill.

*In projects I also load a HTML4 CSS and disable any other style sheets, keeping it simple here...*

## Why 'Arbitrarily'

I didn't want to get into parsing styles, how the image was displayed, what you've actually put in your `srcset` etc. The script just picks a middle value and uses that. Example:

```html
<img srcset="/path/to/image-1200.jpg 1200px, /path/to/image-800.jpg 800px, /path/to/image-400.jpg 400px">
```

Here script sees 3 items in the `srcset` and plumps for the 2nd one. It doesn't understand the numbers, it just picks the middle one. And then sticks it into the img.src.

## API

legacypicturefill exposes `legacypicturefill` globally. If you want to re-run the function:

```javascript
legacypicturefill(document);
```

Or if you are somehow using this on ajax'd content, you can change where the function looks:

```javascript
legacypicturefill(el);
```

Where `el` is the DOM node you want to look inside.

## Issues/Contributing/Discussion

If you find a bug in legacypicturefill, please add it to [the issue tracker](https://github.com/13twelve/legacypicturefill/issues) or fork it, fix it and submit a pull request for it (👍).

Tabs are 2 spaces, functions are commented, variables are camel case and its preferred that its easier to read than outright filesize being the smallest possible.

## Support

I've tested this in a variety of browsers:

* Chrome 15+
* Safari 5.1+
* Firefox 3+
* IE 6+
* Android 4+

Safari 5 and below doesn't understand `<source>` inside of `<picture>` - so legacypicturefill only works on img with `srcset`.

## Filesize

* ~6kb uncompressed
* ~2kb minified
* ~1kb minified and gzipped

## Inspirations

* [picturefill](https://github.com/scottjehl/picturefill)
* [universal-ie6-css](https://github.com/malarkey/universal-ie6-css)
