# flyd-router

HTML5 History Streams

This is essentially a fork of [mithril](https://github.com/lhorie/mithril.js/)'s router, but refactored to work with other frameworks by exposing route changes via flyd streams.

So a couple of things change...

1) Unlike Mithril's router, you're responsible for re-rendering your component yourself somehow.  (if you're using React, consider [react-flyd-component](https://github.com/sdougbrown/react-flyd-componen).
2) No link component as that is also very renderer-specific.

This is intentionally raw, and requires quite a bit of massaging to use.  Mostly, this is just for me to play around with.
