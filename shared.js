;(function () {
  // ---- Inline styles.css for LO recording capture ----
  // <link> hrefs are recorded as relative URLs and break in LO's player (not
  // accessible from their servers). Fetching and injecting an inline <style>
  // tag causes the fingerprint library to capture it via sheet.cssRules, which
  // is portable and works in recording playback.
  fetch('styles.css').then(function (r) { return r.text() }).then(function (css) {
    var st = document.createElement('style')
    st.setAttribute('data-lo-inlined', '')
    st.textContent = css
    document.head.appendChild(st)
  })

  // ---- LO Script Injection ----
  var URLS = {
    production: 'https://tools.luckyorange.com/core/lo.js',
    staging:    'https://storage.googleapis.com/lucky-orange-staging-public/core/lo.js'
  }
  var DEFAULT_IDS = { production: '1dd04a7e', staging: '63101cf1' }
  var cfg = {}
  try { cfg = JSON.parse(localStorage.getItem('lo-config') || '{}') } catch (e) {}
  var env    = cfg.env    || 'production'
  var siteId = cfg.siteId || DEFAULT_IDS[env]
  var s = document.createElement('script')
  s.async = true; s.defer = true
  s.src = URLS[env] + '?site-id=' + siteId
  document.head.appendChild(s)

  // ---- Nav Pages ----
  var PAGES = [
    { href: 'index.html',          label: 'Home' },
    { href: 'slider.html',         label: 'Slider' },
    { href: 'forms.html',          label: 'Forms' },
    { href: 'sensitive.html',      label: 'Sensitive' },
    { href: 'web-components.html', label: 'Web Components' },
    { href: 'dynamic.html',        label: 'Dynamic' },
    { href: 'iframes.html',        label: 'iFrames' },
    { href: 'canvas-svg.html',     label: 'Canvas/SVG' },
    { href: 'tables.html',         label: 'Tables' },
    { href: 'accordion.html',      label: 'Accordion' },
    { href: 'tooltips.html',       label: 'Tooltips' },
    { href: 'drag-drop.html',      label: 'Drag & Drop' },
    { href: 'modals.html',         label: 'Modals' },
    { href: 'rich-text.html',      label: 'Rich Text' },
    { href: 'docs.html',           label: 'Docs ↗', special: true }
  ]

  var currentFile = window.location.pathname.split('/').pop() || 'index.html'

  var navItems = PAGES.map(function (p) {
    var active = currentFile === p.href || (currentFile === '' && p.href === 'index.html')
    var cls    = active ? ' class="active"' : ''
    var style  = p.special ? ' style="color:var(--green);font-weight:bold"' : ''
    return '<li><a href="' + p.href + '"' + cls + style + '>' + p.label + '</a></li>'
  }).join('')

  // ---- Inject Config Bar + Nav (synchronous — renders before page content) ----
  document.body.insertAdjacentHTML('afterbegin',
    '<div class="lo-config-bar">' +
      '<span style="opacity:.5">LO:</span>' +
      '<label><input type="radio" name="lo-env" value="production"> Prod</label>' +
      '<label><input type="radio" name="lo-env" value="staging"> Staging</label>' +
      '<span class="lo-config-sep">│</span>' +
      '<label>Site ID: <input type="text" id="lo-site-id" placeholder="e.g. 1dd04a7e"/></label>' +
      '<button class="lo-apply-btn" id="lo-apply">Apply &amp; Reload</button>' +
      '<span class="lo-status" id="lo-status"></span>' +
    '</div>' +
    '<nav class="site-nav">' +
      '<a href="index.html" class="nav-brand">🌿 LO Test Site</a>' +
      '<ul class="nav-links">' + navItems + '</ul>' +
    '</nav>'
  )

  // ---- Config Bar Logic ----
  document.querySelectorAll('[name="lo-env"]').forEach(function (r) { r.checked = r.value === env })
  document.getElementById('lo-site-id').value = siteId
  document.getElementById('lo-status').textContent = '▸ ' + env + ' / ' + siteId
  document.getElementById('lo-apply').addEventListener('click', function () {
    var newEnv = document.querySelector('[name="lo-env"]:checked').value
    var newId  = document.getElementById('lo-site-id').value.trim() || DEFAULT_IDS[newEnv]
    localStorage.setItem('lo-config', JSON.stringify({ env: newEnv, siteId: newId }))
    location.reload()
  })

  // ---- Footer + Chat + Cookie (after page content is parsed) ----
  document.addEventListener('DOMContentLoaded', function () {

    // Footer
    document.body.insertAdjacentHTML('beforeend',
      '<footer>No plants were harmed in the making of this website.<br/>' +
      '(Several were, however, slightly underwatered.)</footer>'
    )

    // Chat widget
    document.body.insertAdjacentHTML('beforeend',
      '<div class="chat-bubble" id="chat-toggle" title="Simulated chat widget">💬</div>' +
      '<div class="chat-window" id="chat-window">' +
        '<div class="chat-header"><span>Plant Support</span><span id="chat-close" style="cursor:pointer">×</span></div>' +
        '<div class="chat-body" id="chat-body"><div class="chat-msg">Hi! 🌿 How can we help?</div></div>' +
        '<div class="chat-input-row">' +
          '<input type="text" id="chat-input" placeholder="Type a message…"/>' +
          '<button id="chat-send">↑</button>' +
        '</div>' +
      '</div>'
    )

    document.getElementById('chat-toggle').addEventListener('click', function () {
      document.getElementById('chat-window').classList.toggle('open')
    })
    document.getElementById('chat-close').addEventListener('click', function () {
      document.getElementById('chat-window').classList.remove('open')
    })
    function sendChat () {
      var inp  = document.getElementById('chat-input')
      var body = document.getElementById('chat-body')
      var msg  = inp.value.trim()
      if (!msg) return
      var out = document.createElement('div')
      out.className = 'chat-msg outgoing'
      out.textContent = msg
      body.appendChild(out)
      inp.value = ''
      body.scrollTop = body.scrollHeight
      setTimeout(function () {
        var reply = document.createElement('div')
        reply.className = 'chat-msg'
        reply.textContent = '🌿 Thanks! Have you tried watering it?'
        body.appendChild(reply)
        body.scrollTop = body.scrollHeight
      }, 800)
    }
    document.getElementById('chat-send').addEventListener('click', sendChat)
    document.getElementById('chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendChat()
    })

    // Cookie banner (once per session)
    if (!sessionStorage.getItem('cookie-ok')) {
      document.body.insertAdjacentHTML('beforeend',
        '<div class="cookie-banner" id="cookie-banner">' +
          '<span>We use cookies and Lucky Orange to analyze interactions on this test site. <a href="docs.html">Learn more</a></span>' +
          '<div class="cookie-btns">' +
            '<button class="cookie-btn reject" id="cookie-reject">Reject</button>' +
            '<button class="cookie-btn accept" id="cookie-accept">Accept All</button>' +
          '</div>' +
        '</div>'
      )
      function dismissCookie () {
        sessionStorage.setItem('cookie-ok', '1')
        var b = document.getElementById('cookie-banner')
        if (b) b.remove()
      }
      document.getElementById('cookie-accept').addEventListener('click', dismissCookie)
      document.getElementById('cookie-reject').addEventListener('click', dismissCookie)
    }
  })
})()
