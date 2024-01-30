import { Window } from "./Window.js";

export const getBasePath = (path) => {
    return path.substring(0, path.lastIndexOf("/"))
}


/**
 * Returns an object with a method to generate scoped CSS styles.
 *
 * @param {Window} window - the window object
 * @return {Object} an object with a `css` method to generate scoped CSS styles
 */
export const styled = (window) => {
    return {
        css: (strings, ...values) => {
            var str = strings[0];
            for (var i = 0; i < values.length; i++) {
              str += values[i] + strings[i+1];
            }

            return `<style>
            @scope (#${window.id}) {${str}}
            </style>`;
        }
    }
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
export function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }
  