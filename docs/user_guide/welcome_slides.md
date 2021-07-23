<!--# <img style="height:80px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-logo-white.svg">
-->
### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">Welcome to the BioImage Model Zoo!

##### 🔍What you can find:
* Pretrained AI models to perform bioimage analysis tasks. 
* Reference datasets used to train the models (and to test them!)
* Python notebooks to train or fin-tune your models.

##### 🌟Why is worth trying it? 
You can easily run any of the models in user-friendly tools such as Ilastik, deepImageJ, ZeroCostDL4Mic, ImJoy or Fiji.

<!-- .slide: data-background="black" -->
<a class="button" href="https://bioimage.io/">Skip tutorial</a>

-----
### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">BioImage Model Zoo: Overview
<!-- bmz consumer sfotware -->
<img src="https://docs.google.com/drawings/d/e/2PACX-1vQUggA3FQC15eu6xvUYX51PEfqrMbyZud3ujiqXCLEH3F58db23mUEC7Kd2tbKjlfi9cKruwSQuOK18/pub?w=960&amp;h=650">

-----
### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">BioImage Model Zoo: Overview
<!-- bmz choose an item -->
<img src="https://docs.google.com/drawings/d/e/2PACX-1vSYLbtzNfkLbv4onJQZqHqKdxzdLv-7rZAyqITrke-tFOSnOzKq6rcg1uqyuNqxV9CccaHW7BeU_jkD/pub?w=960&amp;h=650">

-----
### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">BioImage Model Zoo: Overview
<!-- search bar -->
<img src="https://docs.google.com/drawings/d/e/2PACX-1vQR8BUgupQr4cjXYB16ocFkyfUMWlnS8kzNJFfcCaFIfLvCeSsoWEh51bd8KpGOG-iApdxmJXZeGlUW/pub?w=960&amp;h=650">

-----
### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">BioImage Model Zoo: Content
<!-- bmz cards -->
<img src="https://docs.google.com/drawings/d/e/2PACX-1vRZ1C-kHXKBo92EjJS2dgUtc09J3rLcPGHWwJucg1oCZ4eDdS7ADoZtiYto4UwHdiHDt3Jya4vmrgFQ/pub?w=906&amp;h=499">

-----

### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">BioImage Model Zoo: Models
<!-- bmz model card-->
<img src="https://docs.google.com/drawings/d/e/2PACX-1vSHjIBGVs_DMTM0uBmAFF75kU_o14kBnUX0HpGhvikGHFoNTjmYOPmIHj2-wdBJohCRven7ixGemeYQ/pub?w=960&amp;h=650">

-----
### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">BioImage Model Zoo: Models
<!-- download model -->
<img src="https://docs.google.com/drawings/d/e/2PACX-1vR_zA5BFsWdKf0msaksD5QnwN6IYPHzpVosYDKIA8R4Bcs9eO9zvb6NUFYPi5icNzLzmiawzSg8u7a3/pub?w=960&amp;h=650">


-----
### <img style="height:100px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg">BioImage Model Zoo: Models
<!-- docuemntation -->
<img src="https://docs.google.com/drawings/d/e/2PACX-1vQvOjOK7thaFDxmqzhsQ0l2O6IAD7nmgjlpaDsEYcZEZ1VcuAUIWAiQ5TtfuiXwog2RaBkhb4Y3AIkU/pub?w=960&amp;h=650">

-----
### Acknowledgements

BioImage.IO is powered by the 🧠 and ❤️ of:
 * deepImageJ Team
 * Fiji/ImageJ Team
 * Ilastik Team
 * ImJoy Team
 * ZeroCostDL4Mic Team
 * ...

Follow us on twitter @bioimageio

-----

# 🙏Thank You!

ImJoy Slides is made by the [@ImJoyTeam](https://twitter.com/imjoyteam).

<!-- startup script  -->
```javascript execute
Reveal.addEventListener('embed-demo', async function(){
  // load the web app via its URL
  viewer = await api.createWindow({src: "https://kaibu.org/#/app", window_id: "kaibu-window"})
  // call api functions directly via RPC
  // add an image layer
  await viewer.view_image("https://images.proteinatlas.org/61448/1319_C10_2_blue_red_green.jpg")
  // add an annotation layer
  await viewer.add_shapes([], {name:"annotation"})
})
```
