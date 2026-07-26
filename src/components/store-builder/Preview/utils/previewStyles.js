// Generates dynamic styles from brand data

export const generatePreviewStyles = function(brandData) {
  var colors = brandData && brandData.colors ? brandData.colors : {};
  var fonts = brandData && brandData.fonts ? brandData.fonts : {};
  
  return {
    // Colors
    primary: colors.primary || '#25D366',
    secondary: colors.secondary || '#111B21',
    tertiary: colors.tertiary || '#008069',
    background: colors.background || '#FFFFFF',
    button: colors.button || '#25D366',
    buttonLabel: colors.buttonLabel || '#005523',
    font: colors.font || '#191C1E',
    
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
    
    getPrimaryStyle: function() {
      return {
        backgroundColor: colors.primary || '#25D366',
        color: colors.background || '#FFFFFF',
      };
    },
    
    getTextStyle: function() {
      return {
        color: colors.font || '#191C1E',
      };
    },
    
    getSecondaryTextStyle: function() {
      return {
        color: colors.secondary || '#556067',
      };
    },
  };
};