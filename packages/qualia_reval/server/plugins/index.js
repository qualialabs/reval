import './plugins.js';

import './ecmascript.js';
import './blaze_html.js';
import './blaze_js.js';
import './blaze_components.js';
import './css.js';

if (require.resolve('meteor/mquandalle:jade-compiler').endsWith('.js')) {
  import './jade.js';
}
