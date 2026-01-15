## Generative Art - Silent Ocean, Version 3.0, 16/1/2026

## Guide users:
1, Click the red center (Pollution burst)
-Clicking inside the red core triggers a burst of visible “trash rings”.
-At the same time, it spawns more hidden trash in the environment.
-Each spawn also increases targetLineHeat → your white lines gradually turn red, showing rising pollution.

2, Hold the mouse (Scanner lens + magnet)
-Holding the mouse creates a circular scanning lens.
-Only inside this lens you can see hidden trash.
-Trash inside the lens is pulled toward your cursor using magnet physics:
force → velocity → damping → speed cap → snap/attach.

3, Release the mouse (Collect trash)
-When you release the mouse, any trash that became attached gets collected (removed).
-Collecting trash reduces targetLineHeat → the lines fade back toward white.
-If you collect everything, the lines reset fully to white.

4, Press R (Reset)
-Press R to reset:
-clears visible + hidden trash
-resets ripples and line color
-respawns a starting set of hidden trash.

5, Sound button (Top-left UI)
-Click the sound button to mute/unmute the entire soundscape.
-The button plays your SoundButtonFinal.wav SFX on click.
-When muted, the system stops all playing sounds and uses a master mute.

6, Visual System (What’s happening on screen)
-Rotating rays are generated via a for loop using cos() / sin() + rotationAngle.
-Ripples expand outward every rippleDelay frames.
-LineHeat system blends the stroke color from white → red using lerpColor() and smooth transitions via lerp().

-Installation
Unzip COMM2754-2025-S3-A3w12-TheRedOcean.zip.
Start a Web Server in the root directory (e.g., using VS Code "Go Live").
Access index.html in your browser. No extra plug-ins required.

-Troubleshooting
Missing Assets: If sounds/images don't load, check the file paths in index.html or the Sounds/ folder.
Best Experience: Use the Live Server extension in Visual Studio Code to ensure all interactive elements function correctly.

## License Information:
 Silent Ocean is licensed under the GPL 3.0 license. See the LICENSE file for more details.

## Credits
- Waste Ripples was created by Hoang Cao Khai as a personal project
- Contact me if you need any helps: 
>Email: hoangcaokhai1411@gmail.com