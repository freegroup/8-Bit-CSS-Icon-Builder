# 🎮 8-Bit CSS Icon Builder

**Pixel by pixel to pure CSS icons!** A minimalist retro editor that combines authentic nostalgia vibes with modern CSS magic.

![8-Bit CSS Icon Builder](https://img.shields.io/badge/Made%20with-Pure%20CSS%20Magic-ff6b6b?style=for-the-badge&logo=css3&logoColor=white)

## ✨ What's This?

A pixel art editor with authentic 8-bit aesthetics! Paint your icons pixel by pixel and export them as **pure CSS** – no JavaScript, no images, just a `<div>` with a CSS class. Magic? Nope, `box-shadow`! 🧙‍♂️

## 🚀 Features

- 🎨 **16 Retro Colors** – C64/NES-inspired palette
- 📐 **8x8 or 16x16 Grid** – Real pixel art!
- ✏️ **Drawing Tools** – Pen, Line, Rectangle, Circle
- 👀 **Live Preview** – 1x, 2x, 4x scaling in real-time
- 📋 **CSS Export** – Copy & paste ready
- 📥 **CSS Import** – Load existing icons back in

## 🎯 How It Works

1. **Pick a color** – From the palette on the left
2. **Paint pixels** – Click & drag on the grid
3. **CSS Preview** – Hit the button
4. **Copy** – Done! 🎉

```html
<!-- That's all you need -->
<div class="my-cool-icon"></div>
```

## 🛠️ Installation

None! Just open `index.html` in your browser. That's it.

## 🤔 The CSS Magic Explained

Every pixel becomes a `box-shadow`! A tiny 1x1px element casts shadows at different positions – and boom, pixel art in pure CSS:

```css
.icon::after {
  width: 1px;
  height: 1px;
  box-shadow:
    3px 2px 0 #ff0000,
    4px 2px 0 #ff0000,
    5px 3px 0 #00ff00;
    /* ... more pixels */
}
```

## 🤝 Contributing

PRs welcome! New features, bug fixes, or just cool icons – bring it on!

## 📜 License

MIT – Do whatever you want!

---

**Made with 💾 and nostalgia** | *Because real devs paint pixels too.*