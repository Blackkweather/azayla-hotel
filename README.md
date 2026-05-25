# Azayla Hotel Website

A beautiful, responsive hotel website for Azayla Hotel in Asilah, Morocco. This is a modern, single-page application showcasing rooms, amenities, gallery, and contact information.

## Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, elegant design with smooth animations and transitions
- **Room Showcase**: Detailed room cards with amenities, specifications, and booking links
- **Image Gallery**: Masonry-style gallery showcasing the hotel and local attractions
- **Contact Section**: Integrated contact form and location information with embedded Google Maps
- **Smooth Navigation**: Smooth scroll navigation between sections
- **Sticky Booking Button**: Fixed booking button for easy access on mobile devices

## Project Structure

```
Azayla-Hotel/
├── index.html              # Main HTML file with all content and styling
├── images/                 # Image assets directory
│   ├── rooms/             # Room photos organized by room type
│   └── attractions/       # Local attraction photos
├── README.md              # This file
└── .gitignore            # Git ignore file
```

## Fixed Issues

### 1. **Broken Image Paths**
   - **Issue**: Gallery section referenced non-existent `azayla hotel pics/` directory
   - **Fix**: Reorganized all images into a proper `images/` directory structure with subdirectories for `rooms/` and `attractions/`

### 2. **Hero Background Image**
   - **Issue**: Referenced a temporary/expired CDN URL that may not load
   - **Fix**: Replaced with a reliable Unsplash image URL for hotel/bedroom background

### 3. **Directory Structure**
   - **Issue**: Directory names with spaces and special characters (`Local Attractions pics`, `aa Rooms pics`) are problematic for web servers
   - **Fix**: Renamed to clean, web-friendly names: `attractions` and `rooms`

### 4. **Unnecessary Files**
   - **Issue**: `readfile.ps1` PowerShell script was not needed for the web project
   - **Fix**: Removed the file

### 5. **Gallery References**
   - **Issue**: Gallery section had many broken image references to non-existent files
   - **Fix**: Updated all gallery image paths to point to existing files in the reorganized `images/` directory

### 6. **Booking Links**
   - **Issue**: Booking URLs were overly complex with tracking parameters
   - **Fix**: Simplified to clean Booking.com URLs

## Installation & Usage

### Local Development

1. Clone or download the repository
2. Open `index.html` in your web browser
3. No build process or dependencies required - it's pure HTML/CSS/JavaScript

### Deployment

Simply upload all files to your web server:
- Upload `index.html` to the root directory
- Upload the `images/` folder with all subdirectories
- Ensure the directory structure is maintained on the server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors
Edit the CSS variables in the `<style>` section:
```css
:root {
    --deep-blue: #1b3a4b;
    --sand: #f4ede0;
    --terracotta: #c1714f;
    --gold: #d4a849;
    --white: #ffffff;
}
```

### Fonts
The website uses Google Fonts:
- **Headings**: Cormorant Garamond
- **Body**: Nunito Sans

### Contact Information
Update the contact details in the Location and Contact sections:
- Phone: +212 539 416 717
- Email: azayla.hotel@gmail.com
- Address: Medina, Asilah 78250, Morocco

## Performance Optimizations

- Lazy loading for gallery images
- CSS animations with GPU acceleration
- Optimized image formats (JPEG, WebP, AVIF)
- Minimal JavaScript for smooth interactions
- Mobile-first responsive design

## SEO

- Semantic HTML structure
- Meta tags for viewport and charset
- Descriptive alt text for all images
- Proper heading hierarchy
- Open Graph ready (can be enhanced with meta tags)

## License

This project is proprietary to Azayla Hotel. All rights reserved.

## Support

For issues or questions about the website, please contact:
- Email: azayla.hotel@gmail.com
- Phone: +212 539 416 717

---

**Last Updated**: May 2026
**Version**: 1.0 (Fixed)
