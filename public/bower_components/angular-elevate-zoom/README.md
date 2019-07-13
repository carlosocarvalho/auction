angular-elevate-zoom
========================

Directive & service to wrap [elevate zoom](http://www.elevateweb.co.uk/image-zoom/examples). This directive requires [elevate zoom](https://github.com/elevateweb/elevatezoom) which also depends on jQuery.

## Requirements
- ([jQuery](http://jquery.com/))
- ([elevate zoom](https://github.com/elevateweb/elevatezoom))
- ([AngularJS](http://angularjs.org/))

## Install

```bash
$ bower install angular-elevate-zoom
```

### Html snippet

```html

<script src="../bower_components/angular-elevate-zoom/build/angular-elevate-zoom.min.js"></script>

<div class="col-lg-10 carousel slide">
    <div class="carousel-inner">
        <div class="item" ng-class="{active: $index === 0}" ng-repeat="image in images">
            <img id="catImg-{{$index}}" class="img-responsive" ez-zoom ng-src="{{image.catalog}}" alt="{{image.alt}}" title="{{image.alt}}" ez-zoom-config="{'tint':true, 'tintColour':'#F90', 'tintOpacity':0.5}" ez-zoom-image="{{selectedCarouselImage == $index ? image.zoom : ''}}">
        </div>
    </div>
</div>

```

## License
The MIT License (MIT)

Copyright (c) 2015 AppFeel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
