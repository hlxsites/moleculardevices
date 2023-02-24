// eslint-disable-next-line import/no-cycle
import { sampleRUM } from "./lib-franklin.js";

// Core Web Vitals RUM collection
sampleRUM("cwv");

// add more delayed functionality here

/* TODO - Move this to a better place */
document.querySelectorAll(".carousel-item.selected").forEach((item) => {
  item.parentNode.scrollTo({
    top: 0,
    left: item.offsetLeft - item.parentNode.offsetLeft - 200,
  });
});
