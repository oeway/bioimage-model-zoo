<!--# <img style="height:80px;" alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-logo-white.svg">
-->
### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">Welcome to the BioImage Model Zoo!

##### 🔍What you can find:
* <font size="5"> Pretrained AI models to perform bioimage analysis tasks. </font>  
* <font size="5"> Reference datasets used to train the models (and to test them!) </font>
* <font size="5"> Python notebooks to train or fin-tune your models. (and to test them!) </font>

##### 🌟Why is worth trying it? 
You can easily run any of the models in user-friendly tools such as Ilastik, deepImageJ, ZeroCostDL4Mic, ImJoy or Fiji.

<!-- .slide: data-background="black" -->
<a class="button" href="https://bioimage.io/">Skip tutorial</a>
<a class="button" href="https://bioimage.io/docs/#/">Back to the documentation</a>
-----
### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">BioImage Model Zoo: Overview
<!-- bmz consumer sfotware -->
<img style="height: 60vh" src="https://docs.google.com/drawings/d/e/2PACX-1vTrEfb0hh_KcH153chS99oiQbNgz4K8vmkGiWCwkEtiLdfCY_maHYKwKX_f6sSStWMhL-6BsEtEIttO/pub?w=960&amp;h=720">

-----
### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">BioImage Model Zoo: Overview
<!-- bmz choose an item -->
<img style="height: 60vh" src="https://docs.google.com/drawings/d/e/2PACX-1vTjdCZdvnocOMsZqOlzW-JEzhDY2a99XDSSRcqb7XUu27vdL4vcWZOtH8B8t3pc3IGSPcCo-b_EakMX/pub?w=960&amp;h=720">

-----
### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">BioImage Model Zoo: Overview
<!-- search bar -->
<img style="height: 60vh" src="https://docs.google.com/drawings/d/e/2PACX-1vTJ9MugED7OT1r7DoL_RXe3P-SzDDspfamwdAg5mNDBebiHLBQ0xMusnPQFwsAPzY5QEhu2LusM0DVz/pub?w=960&amp;h=720">

-----
### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">BioImage Model Zoo: Content
<!-- bmz cards -->
<img style="height: 60vh" src="https://docs.google.com/drawings/d/e/2PACX-1vSVO0mBQ8nWLfjkEcLmia3OsKVFzJm7WdOFpciD7PW1-Z2me_xTvYB0TIJqG7TV4eGMjg3pLU4Kk8jB/pub?w=906&amp;h=499">

-----

### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">BioImage Model Zoo: Models
<!-- bmz model card-->
<img style="height: 60vh" src="https://docs.google.com/drawings/d/e/2PACX-1vSUpvNPtKE3VcuYUFuM7cO3XCRnt2V50ougTbBPTSns4XSGX770jOou_hRR7u7BjdCLVqUaaW78NDx-/pub?w=1072&amp;h=615">

-----
### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">BioImage Model Zoo: Models
<!-- download model -->
<img style="height: 60vh" src="https://docs.google.com/drawings/d/e/2PACX-1vTViy4NgvCSBQL3D4a8GevS3TwO93Tsir4zk5PXXJudCiRMeJ1KRpLqjSjlt_jSDmJgO7HnePIqCIbl/pub?w=950&amp;h=515">


-----
### <img alt="BioImage Model Zoo" src="https://bioimage.io/static/img/bioimage-io-icon.svg" width="70">BioImage Model Zoo: Models
<!-- docuemntation -->
<img style="height: 60vh" src="https://docs.google.com/drawings/d/e/2PACX-1vSovuMPiiSkff9YdePPhOzcKA-lzF6hU6MYHKZaLN20GFVfSXUPEBr3meB2ihTpqeFucEaepVY33VfW/pub?w=960&amp;h=720"  align="right">

##### If you want to know more about the BioImage Model Zoo, check out the documentation or 📩 <a href="https://oeway.typeform.com/to/K3j2tJt7" target="_blank">contact us.</a>

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
