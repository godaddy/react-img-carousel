# 2.1.1 - Aug 2021

***(Bug Fix)*** Fixes the index passed to beforeChange callback when infinite scrolling is enabled.

# 2.1.0 - May 2021

***(Feature)*** Adds support for a slideAlignment prop

# 2.0.3 - May 2021

***(Bug Fix)*** Fixes an issue introduced by 2.0.1 where long text content on slides is no longer wrapping

# 2.0.2 - May 2021

***(Bug Fix)*** Fixes a bug when clicking to navigate to a particular slide and crossing the end or beginning of the list

# 2.0.1 - May 2021

***(Bug Fix)*** Fixes a bug in Safari 14.1 and Mobile Safari where carousel content is not visible in some scenarios

# 2.0.0 - Dec 2020

***(Enhancement)*** Breaking change to optimize the bundle for modern browsers (may break legacy browser support)

# 1.7.0 - Apr 2020

***(FEATURE)*** Add support for IntersectionObserver and disable autoplay functionality when the carousel is outside the viewport

# 1.6.0 - Feb 2020

***(FEATURE)*** Add `onSlideTransitioned` callback and updated `arrows` prop to support custom arrows

# 1.5.4 - Nov 2019

***(Enhancement)*** Replaced example application with Storybook

# 1.5.3 - Nov 2019

***(Enhancement)*** Only call preventDefault in mousedown handler when the target is an img element

# 1.5.2 - Sept 2019

***(Bug Fix)*** Fix issue that can cause the initial carousel positioning to be off

# 1.5.1 - Sept 2019

***(Bug Fix)*** Fix issue that can cause the slideshow to never render

# 1.5.0 - Sept 2019

* ***(FEATURE)*** Add support for `maxRenderedSlides` prop
