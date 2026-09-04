import { COLORBLIND_KEY, NIGHTMODE_KEY } from "./device-theme"

// Inline in <body> before any content: the theme is on the device, the server
// cannot know it, and applying it in an effect would flash the light theme.
export const THEME_BOOT_SCRIPT = `(function(){try{
var s=window.localStorage,b=document.body;
var n=s.getItem(${JSON.stringify(NIGHTMODE_KEY)});
var dark=n===null?window.matchMedia("(prefers-color-scheme: dark)").matches:JSON.parse(n)===true;
var c=s.getItem(${JSON.stringify(COLORBLIND_KEY)});
b.classList.toggle("nightmode",dark);
b.classList.toggle("colorblind",c!==null&&JSON.parse(c)===true);
}catch(e){}})()`
