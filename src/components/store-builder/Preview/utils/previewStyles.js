// Generates dynamic styles from brand data
//
// ✅ New brand color system (see design discussion): Tertiary and Element
// removed (unused everywhere), Font split into Header/Body, Secondary
// repurposed from "muted text" to "default/inactive state of toggles,
// checkboxes, progress bars" (muted text now comes from Font Body).
// `font` is still read as a fallback for fontHeader so stores saved before
// this change don't lose their header color.

export const generatePreviewStyles = function(brandData) {
  var colors = brandData && brandData.colors ? brandData.colors : {};
  var fonts = brandData && brandData.fonts ? brandData.fonts : {};

  return {
    // Colors
    primary: colors.primary || '#25D366',
    secondary: colors.secondary || '#E0E3E6',
    background: colors.background || '#FFFFFF',
    button: colors.button || '#25D366',
    buttonLabel: colors.buttonLabel || '#005523',
    fontHeader: colors.fontHeader || colors.font || '#191C1E',
    fontBody: colors.fontBody || '#556067',

    // Fonts
    headingFont: fonts.heading || 'Inter',
    bodyFont: fonts.body || 'Inter',
    baseFontSize: fonts.baseFontSize || '16px',

    // Helper functions
    getButtonStyle: function() {
      return {
        backgroundColor: colors.button || '#25D366',
        color: colors.buttonLabel || '#005523',
      };
    },

    // Active/selected state for toggles, checkboxes, progress bars, etc.
    getActiveStyle: function() {
      return {
        backgroundColor: colors.primary || '#25D366',
      };
    },

    // Default/inactive state of the same elements
    getInactiveStyle: function() {
      return {
        backgroundColor: colors.secondary || '#E0E3E6',
      };
    },

    getHeaderTextStyle: function() {
      return {
        color: colors.fontHeader || colors.font || '#191C1E',
      };
    },

    getBodyTextStyle: function() {
      return {
        color: colors.fontBody || '#556067',
      };
    },
  };
};
