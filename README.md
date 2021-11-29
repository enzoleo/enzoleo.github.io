# Homepage

Hi, this is the repository maintaining personal homepage. This website is simple and clean, based on the default theme [Millennial](https://github.com/LeNPaul/Millennial).

## Local Rendering

Some dependencies should be installed first.

```shell
sudo apt-get install ruby-full ruby-bundler
```

On MacOS, the suggested installation is via `Homebrew`.

```shell
brew install ruby@2.6
gem install bundler:2.2.20
```

Now go into the root directory and run the following command to render the website locally.

```shell
bundle config set --local path 'vendor/bundle'
bundle install
bundle update
bundle exec jekyll serve
```

Note that the version is specific, as the latest release may introduce unexpected errors to render the pages. Please kindly downgrade to the version specified above if any unexpected error occurs during your local rendering. For more details, please refer to the [documentation](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll).

## Fonts

The `favicon.svg` is generated based on [`Permanent Marker`](https://fonts.google.com/specimen/Permanent+Marker?category=Handwriting&preview.text=E&preview.text_type=custom#standard-styles) font. Besides, the guide on the top-left of the navigation bar uses [`Pacifico`](https://fonts.google.com/specimen/Pacifico?category=Handwriting&preview.text=E&preview.text_type=custom) font via web link. Please find their licenses and more details from the according pages.
