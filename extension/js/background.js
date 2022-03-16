/**
 * 记录每个 tab 页的信息
 * @type {Map<number, boolean>}
 */
const tabinfo = new Map();

/**
 * 扫描响应头，是否含有 Content-Security-Policy
 * @param {chrome.webRequest.HttpHeader[]} headers
 * @returns {boolean}
 */
function hasCSP(headers = []) {
    return headers.some(
        (x) => x.name.toLowerCase() === "content-security-policy"
    );
}


/**
 * 响应头里CSP相关的选项
 * @type {string[]}
 */
const removeCSP=[
    'content-security-policy',
    'content-security-policy-report-only',
    'expect-ct',
    'report-to',
    'x-content-security-policy',
    'x-webkit-csp',
    'x-xss-protection',
    'x-permitted-cross-domain-policies',
    'x-content-type-options',
    'x-frame-options',
    'permissions-policy',
    'timing-allow-origin'
];

/**
 * 移除CSP
 * 参考文档：
 *   1、 https://developer.chrome.com/docs/extensions/reference/webRequest/#event-onHeadersReceived
 *   2、  https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/trusted_types_on_webui.md
 *   3、 https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/trusted-types
 *   4、 Arrow_Function 箭头函数
 *   5、 返回新的新的响应头： return {responseHeaders: details.responseHeaders};
 *   6、Chrome 新增的可信类型（Trusted types），暂时不知道怎么解决
 *
 */

chrome.webRequest.onHeadersReceived.addListener(
    (details)=>{
        tabinfo.set(details.tabId, hasCSP(details.responseHeaders)); //暂时不知道什么地方用到
        return {
            responseHeaders:details.responseHeaders.filter(
                header =>!removeCSP.includes(header.name.toLowerCase())
            )
        };
  },
  {
//    urls: ["<all_urls>"],
    //需要移除CSP自己添加url
    urls: [
        "*://ajax.googleapis.com/*",
        "*://fonts.googleapis.com/*",
        "*://themes.googleusercontent.com/*",
        "*://fonts.gstatic.com/*",
        "*://*.google.com/*",
        "*://secure.gravatar.com/*",
        "*://www.gravatar.com/*",
        "*://maxcdn.bootstrapcdn.com/*",
        '*://api.github.com/*',
        '*://www.gstatic.com/*',
        '*://stackoverflow.com/*',
        '*://translate.googleapis.com/*',
        "*://developers.redhat.com/*",
        "*://cloud-soft.xieyaokun.com/*"
    ],
    types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]
  },
  ["blocking", 'responseHeaders']
);

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Comment out these lines
    // The returned data is NOT a webRequest.BlockingResponse type data, will cause error on Chrome Version 87 88 90
    // see https://github.com/justjavac/ReplaceGoogleCDN/issues/64#issuecomment-839610913
    // see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest

    // If we need to deal with the CSP, we must return the right data type but not simple a url string.

    // if (tabinfo.get(details.tabId)) {
    //     return details.url;
    // }

    let url = details.url.replace("http://",          "https://");
    /* 中科大 */
    //url = url.replace("ajax.googleapis.com",          "ajax.proxy.ustclug.org");          // Google 前端公共库
    //url = url.replace("fonts.googleapis.com",         "fonts.proxy.ustclug.org");         // Google 字体
    //url = url.replace("fonts.gstatic.com",            "fonts-gstatic.proxy.ustclug.org");
    //url = url.replace("themes.googleusercontent.com", "google-themes.proxy.ustclug.org");
    /* 极客族 */
    //url = url.replace("ajax.googleapis.com",          "gapis.geekzu.org/ajax");     // Google 前端公共库
    //url = url.replace("fonts.googleapis.com",         "fonts.geekzu.org");          // Google 字体
    //url = url.replace("fonts.gstatic.com",            "gapis.geekzu.org/g-fonts");
    //url = url.replace("themes.googleusercontent.com", "gapis.geekzu.org/g-themes");
    //url = url.replace("www.gravatar.com/avatar",      "sdn.geekzu.org/avatar");     // Gravatar 头像
    //url = url.replace("secure.gravatar.com/avatar",   "sdn.geekzu.org/avatar");
    /* 烧饼博客 */
    url = url.replace("ajax.googleapis.com",          "ajax.loli.net");     // Google 前端库
    url = url.replace("cdn.bootcdn.net",              "cdnjs.loli.net");    // CDNJS
    url = url.replace("cdnjs.cloudflare.com",         "cdnjs.loli.net");
    url = url.replace("fonts.googleapis.com",         "fonts.loli.net");    // Google 字体
    url = url.replace("fonts.gstatic.com",            "gstatic.loli.net");
    url = url.replace("themes.googleusercontent.com", "themes.loli.net");
    url = url.replace("www.gravatar.com",             "gravatar.loli.net"); // Gravatar 头像
    url = url.replace("secure.gravatar.com",          "gravatar.loli.net");
    /* 知乎 (包不全，目前已知没有 node-forge 包) */
    //url = url.replace("unpkg.com",                  "unpkg.zhimg.com");   // UNPKG
    //url = url.replace("cdn.jsdelivr.net/npm/",      "unpkg.zhimg.com/");  // jsDelivr
    /* 百度 */
    url = url.replace("unpkg.com",                    "code.bdstatic.com/npm");  // UNPKG
    url = url.replace("cdn.jsdelivr.net/npm/",        "code.bdstatic.com/npm/"); // jsDelivr
    /* Google */
    url = url.replace("www.google.com/recaptcha/",          "www.recaptcha.net/recaptcha/");  // reCAPTCHA
    /* 七牛云 */
    url = url.replace("maxcdn.bootstrapcdn.com/bootstrap/", "cdn.staticfile.org/bootstrap/"); // Bootstrap
    return {
        redirectUrl: url
    };
  },
  {
    urls: [
      /* 烧饼博客 */
      "*://ajax.googleapis.com/*",               // Google 前端库
      "*://cdn.bootcdn.net/*",                   // CDNJS
      "*://cdnjs.cloudflare.com/*",
      "*://fonts.googleapis.com/*",              // Google 字体
      "*://fonts.gstatic.com/*",
      "*://themes.googleusercontent.com/*",
      "*://www.gravatar.com/*",                  // Gravatar 头像
      "*://secure.gravatar.com/*",
      /* 百度 */
      "*://unpkg.com/*",                         // UNPKG
      "*://cdn.jsdelivr.net/npm/*",              // jsDelivr
      /* Google */
      "*://www.google.com/recaptcha/*",          // reCAPTCHA
      /* 七牛云 */
      "*://maxcdn.bootstrapcdn.com/bootstrap/*", // Bootstrap

    ],
  },
  ["blocking"]
);

chrome.tabs.onRemoved.addListener(function (tabId) {
  tabinfo.delete(tabId);
});
