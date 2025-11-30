# New to Onshape

## Performance Tuning

After your initial account setup, Onshape will run a browser check to ensure compatibility. Depending on your browser, additional steps can be taken to improve performance.

!!! Tip
    You can test your current performance at the [Onshape Compatibility Check Page](https://cad.onshape.com/check "Compatibility Check").

!!! Note
    If the browser check fails, you may want to try a different browser. Currently, chromium browsers like Chrome, Edge, Opera, and Arc are the best supported browsers for Onshape, but Firefox usually works with no issues as well. Safari is not well supported.

### Improving Chrome Performance
If you are using Chrome, You can try modifying the following settings to improve rendering speeds.

- First, type `chrome://settings/` in your search bar to navigate to chrome settings. Make sure that "Use graphics acceleration when available" is enabled. Relaunch chrome if you have updated it to enable it.

  ![](../img/performance-tuning/graphicsacceleration.webp#bordered){width=80%}

- Go to `chrome://flags/` and enable "Override Software Rendering List":

  ![](../img/performance-tuning/override-rendering-list.webp#bordered){width=80%}


- Finally, Try adjusting your ANGLE graphics backend:

  ![](../img/performance-tuning/ANGLE-backend.webp#bordered){width=80%}


Please note that performance will depend on your individual computer setup. We suggest the following process:

- Choose an ANGLE graphics backend: `chrome://flags/#use-angle`
- Click the Relaunch button
- [Check your performance](https://cad.onshape.com/check "Compatibility Check")

Repeat these steps for each backend and use whichever is the most performant. Here are some examples all taken from the same machine.

<!-- Slideshow -->
<div class="slideshow">
    <img src="../../img/performance-tuning/performance-examples/default.webp" style="width:90%">
    <div class="slide-caption">
        The default configuration
    </div>
    <img src="../../img/performance-tuning/performance-examples/opengl.webp" style="width:90%">
    <div class="slide-caption">
        OpenGL
    </div>
    <img src="../../img/performance-tuning/performance-examples/D3D9.webp" style="width:90%">
    <div class="slide-caption">
        Direct3D 9
    </div>
    <img src="../../img/performance-tuning/performance-examples/D3D11.webp" style="width:90%">
    <div class="slide-caption">
        Direct3D 11
    </div>
    <img src="../../img/performance-tuning/performance-examples/D3D11on12.webp" style="width:90%">
    <div class="slide-caption">
        Direct3D 11 on 12
    </div>
</div>


In the above example, Direct3D 11 narrowly beats out OpenGL, but that won't always be the case.

<br>