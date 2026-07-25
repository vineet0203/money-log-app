const sharp = require('sharp');

async function processIcons() {
  const iconPath = '/Users/atomic/Downloads/AppIcons/appstore.png';
  const adaptivePath = '/Users/atomic/Downloads/AppIcons/playstore.png';
  const green = '#6BCB77';

  try {
    // 1. Process main icon.png
    // We will place the icon on a green background in case it has transparent corners.
    // Flatten composites it against a background.
    await sharp(iconPath)
      .flatten({ background: green })
      .toFile('./assets/images/icon.png');
    console.log('Processed icon.png');

    // 2. Process adaptive-icon.png
    // We want the logo to be smaller (around 600px) and padded with green up to 1024x1024.
    // Also flatten against green.
    await sharp(adaptivePath)
      .resize(600, 600, { fit: 'contain', background: green })
      .flatten({ background: green })
      .extend({
        top: 212, bottom: 212, left: 212, right: 212,
        background: green
      })
      .toFile('./assets/images/adaptive-icon.png');
    console.log('Processed adaptive-icon.png');
    
  } catch (error) {
    console.error('Error processing icons:', error);
  }
}

processIcons();
