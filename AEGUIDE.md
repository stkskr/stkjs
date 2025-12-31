# AE Site Management Guide

Welcome to the AE Site Management Guide! Here you can learn all about how to easily edit, add to, and maintain the STKS homepage.

## Table of Contents

1. [Files AEs Should Edit](#files-aes-should-edit)
2. [File and Folder Map](#file-and-folder-map)
   - [content.ts](#contentts)
   - [faq.ts](#faqts)
   - [portfolio.ts](#portfoliots)
   - [portfolio/full](#portfoliofull)
   - [portfolio/thumbnails](#portfoliothumbnails)
3. [How to Upload to the Portfolio](#how-to-upload-to-the-portfolio)
4. [How to Fill in the Template](#how-to-fill-in-the-template)
   - [Commented Title](#1-commented-title)
   - [ID for URL and Image Paths](#id-for-url-and-image-paths)
   - [Project Title to Display on Website](#project-title-to-display-on-website)
   - [Client Name](#client-name)
   - [Video URL](#video-url-delete-if-unneeded)
   - [Project Category](#project-category)
5. [How to Add Images and Thumbnails](#how-to-add-images-and-thumbnails)

---

## Files AEs Should Edit

These are the only parts of the site project AEs should ever touch:

* The data folder and its files (src/components/data): 
    * content.ts
    * faq.ts
    * portfolio.ts
* The portfolio image folders (public/assets/portfolio)
    * full
    * thumbnails

## File and Folder Map

### content.ts
Where you can edit the text in the header of each page (in the right side quadrant of the About, Services, Portfolio, and Clients Say pages)

### faq.ts
Where you can edit the Contact tab, and the questions and answers of the FAQ found at the bottom of each page. 

### portfolio.ts
Where you edit or add new projects to the portfolio. 

### portfolio/full
Images that appear in the modal (pop-up).

### portfolio/thumbnials
Images that appear as the thumbnail.

# How to upload to the portfolio
1. Open `portfolio.ts` in Notepad++
2. Scroll to the bottom and place your cursor above `/// ADD NEW JOBS ABOVE THIS TEXT`.
3. Paste the following template and fill in the data:
```
  // ============================================================
  // Title of Project
  // ============================================================
  {
    id: 'insert-title-here',
    title: {
      ko: '한국어 이름',
      en: 'English Title',
    },
    client: 'Client Company',
    videoUrl: 'https://youtube.com/...'
    mediaType: 'category',
    mission: {
      ko: '등등등',
      en: 'blah blah blah.',
    },
    solution: {
      ko: '등등등.',
      en: 'blah blah blah.',
    },
  },
```
4. File > Save

## How to fill in the template

Except for the **Commented Title**, all of what you need to fill in follows this format:
```
prompt: 'response',
```

For all of these, there must be a `'` on both sides of your response. You must also keep the `,` at the end of the line. For example:

**GOOD:**

`id: 'lg-project-2025',` ✅ Perfect! 

**BAD:**

`id: lg-project-2025,` ❌ Missing quotation marks

`id: 'lg-project-2025'` ❌ Missing final comma

`id: lg_project_2025,` ❌ Using underscores instead of dashes

`id: 'LG Project 2025',` ❌ Using spaces and capital letters


### 1. Commented Title

```
  // ============================================================
  // Title of Project
  // ============================================================
```
This is just a "comment" in the data file, meaning it won't effect anything on the actual site or backend. We simply put these titles in to see divisions betweens jobs more clearly and make it easier to navigate the data file. Replace `Title of Project` with the project name you want to add.

---

### ID for URL and Image Paths
```
id: 'insert-title-here',
```
Replace `insert-title-here` with your unique project name. 

The text you input here will be used for the project URL and you will use it when you name the thumbnail and other project images later. 

For consistency, write the entire title in lowercase letters and use `-` to separate words. **DO NOT** use `.` or `_` in the title.

---

### Project Title to Display on Website

```
title: {
      ko: '한국어 이름',
      en: 'English Title',
    },
```

This is what will be used as the project header when you click a thumbnail to view it. Simply replace `한국어 이름` with the Korean project name and `English Title` with the English.

Unlike the previous `id` section, here you should to use spaces and capital letters. 

**NOTE:** If the title you want to use contains the special characters ' or a ", like in **LG CES '22 Speech**, put a `\` before the special character:

```
title: {
      ko: 'LG CES \'22 스피치',
      en: 'LG CES \'22 Speech',
    },
```

If you want, you can use this [online tool](https://onlinestringtools.com/escape-string) to add any `\`'s automatically.

---

### Client Name
```
 client: 'Client Company',
```

Replace `Client Company` with the client name. Like the Project Title, this field allows for spaces, capitalization, special characters, etc. 

---

### Video URL (DELETE IF UNNEEDED)

```
videoUrl: 'https://youtube.com/...'
```

Place a link to the video you need to embed here. 

If you will use images instead of a video, **delete this line from the data**. 

---

### Project Category
```
    mediaType: 'category',
```

Add either `video`, `online`, `branding`, `sns`, `ooh`, and/or `script` to replace `category`. This allows the user to view the project when they are filtering our whole portfolio. 

**NOTE::** If you want to add multiple categories, simply separate them by commas:

```
    mediaType: 'video, branding',
```

## How to add images and thumbnails

For any project, use the exact same `id` for the file name that you used when you filled in the data. 

Thumbnail images go in the `thumbnail` folder. Modal (pop-up) images go in the `full` folder. Often times, the thumbnail image and full image will have the same file name. This is normal. 

All images must follow this format:

```
##_project-id-from-before.jpg
```

The `##` can be any two digit number you want, such as `01` or `23`. We use this number to order the projects in the portfolio. 

If a project has more than one image for the modal, we add a second `_##` to the end. For example:

```
25_amore-pacific-vision-statement_01.jpg
25_amore-pacific-vision-statement_02.jpg
25_amore-pacific-vision-statement_03.jpg
```

In this example, we've set `amore-pacific-vision-statement`` as project number 23, and its carousel will include three images. 

If the `id` from `portfolio.ts` matches the image file names, and the image files are in the `thumbnails` and `full` folders, they will be uploaded automatically. 