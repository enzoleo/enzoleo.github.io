# Homepage

Hi, this is the repository maintaining personal homepage. This website is simple and clean, based on the default theme [Millennial](https://github.com/LeNPaul/Millennial).

## Local Rendering

Some dependencies should be installed first.

```shell
sudo apt-get install ruby-full ruby-bundler
```

Now go into the root directory and run the following command to render the website locally.

```shell
bundle install --path vendor/bundle
bundle update
bundle exec jekyll serve
```

## Fonts

The `favicon.svg` is generated based on [`Permanent Marker`](https://fonts.google.com/specimen/Permanent+Marker?category=Handwriting&preview.text=E&preview.text_type=custom#standard-styles) font. Besides, the guide on the top-left of the navigation bar uses [`Pacifico`](https://fonts.google.com/specimen/Pacifico?category=Handwriting&preview.text=E&preview.text_type=custom) font via web link. Please find their licenses and more details from the according pages.
