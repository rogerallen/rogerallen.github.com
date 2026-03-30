## [rogerallen.github.io](http://rogerallen.github.io)

My blog based on
[https://github.com/plusjade/jekyll-bootstrap](https://github.com/plusjade/jekyll-bootstrap)
and
[https://github.com/kevinxueliang/jb-svbtle](https://github.com/kevinxueliang/jb-svbtle)
along with some changes of my own.

## Usage

`> jekyll serve HOST=YOUR_IP_ADDRESS`

`> jekyll serve --drafts HOST=YOUR_IP_ADDRESS`


## Update 2026-03-30

Gemini suggests this:

I've reviewed your repository and noted that it's a Jekyll-based blog using the Jekyll-Bootstrap framework. Since you're moving to Ubuntu 24.04, here is a tailored set of suggestions for your tooling.

### 1. Essential System Packages
First, ensure you have the necessary build tools and libraries for Ruby and Jekyll. Ubuntu 24.04 includes a modern Ruby version, but you'll still need the headers and compilers for native gem extensions.

```bash
sudo apt update
sudo apt install build-essential ruby-dev make git libyaml-dev zlib1g-dev libffi-dev
```

### 2. Ruby Version Management (Recommended)
You mentioned in your `README.md` that transferring this project is "always so painful" due to Ruby versioning. I strongly recommend using **rbenv** to isolate your blog's Ruby environment from the system Ruby. This allows you to stick to a stable version (like 3.1 or 3.2) that works with your older Jekyll-Bootstrap setup.

**Install rbenv and ruby-build:**
```bash
sudo apt install rbenv
# Add to your shell config (~/.bashrc)
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

# Install ruby-build as a plugin
mkdir -p "$(rbenv root)"/plugins
git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build

# Install and set a Ruby version
rbenv install 3.2.3
rbenv global 3.2.3
```

### 3. Jekyll and Bundler
Once Ruby is set up, install the core gems. I didn't see a `Gemfile` in your root, but I recommend creating one to lock your versions.

```bash
gem install jekyll bundler
```

### 4. Project Workflow & Automation
Your project already has a `Makefile` and `Rakefile`. You can continue using these for your daily tasks:

*   **Preview Site:** `make serve` (runs `jekyll serve --watch`)
*   **Preview with Drafts:** `make serveall`
*   **New Post:** `rake post title="My New Post"`
*   **New Page:** `rake page name="new-page.md"`

### 5. Recommended Editor & Extensions
For a smooth development experience on Ubuntu, **Visual Studio Code** is the standard choice. I recommend these extensions:
*   **Jekyll Snippets:** For Liquid tags and front-matter.
*   **Ruby LSP:** For better Ruby support in your `Rakefile`.
*   **Markdown All in One:** To help with your `.md` posts.

### 6. GitHub CLI (`gh`)
Since this is a GitHub Pages site, the GitHub CLI is very useful for managing PRs or checking CI/CD build statuses:
```bash
sudo apt install gh
gh auth login
```

### 7. Optional: Creating a `Gemfile`
To make your future migrations (e.g., to Ubuntu 26.04) easier, I suggest creating a `Gemfile` in your project root:
```ruby
source "https://rubygems.org"
gem "jekyll", "~> 3.9" # Matches GitHub Pages versioning
gem "github-pages", group: :jekyll_plugins
gem "rake"
```
Then you can just run `bundle install` and `bundle exec jekyll serve`.


## Update 2020-12-29

Reset on Ubuntu 20.04.  Let's see...

```
> sudo apt-get install ruby ruby-dev make build-essential

> ruby --version 
ruby 2.7.0p0 (2019-12-25 revision 647ee6f091) [x86_64-linux-gnu]


> vi ~/.bashrc
  # ruby & jekyll exports
  export GEM_HOME=$HOME/gems
  export PATH=$HOME/gems/bin:$PATH

> gem install jekyll bundler
  ...
  Please check your Rails app for 'config.i18n.fallbacks = true'.
  If you're using I18n (>= 1.1.0) and Rails (< 5.2.2), this should be
  'config.i18n.fallbacks = [I18n.default_locale]'.
  If not, fallbacks will be broken in your app by I18n 1.1.x.
  ...

> jekyll serve 
  Works! (yay!)

```

## Update 2020-07-26

Setting up on Ubuntu 16.04 after a long hiatus.  It's always so painful transferring this to a new 
computer since I don't really use Jekyll or Ruby for anything else.

Got some hints from here: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-jekyll-development-site-on-ubuntu-16-04
```
sudo apt-get install ruby ruby-dev make build-essential
vi ~/.bashrc

  # ruby & jekyll exports
  export GEM_HOME=$HOME/gems
  export PATH=$HOME/gems/bin:$PATH
source ~/.bashrc
gem install jekyll bundler
```

Of course this won't work out of the box!
```
gem install jekyll
ERROR:  Error installing jekyll:
        jekyll-sass-converter requires Ruby version >= 2.4.0.
```

So, let's update our ruby... Apparently rbenv is the way to keep ruby versions sane...
So says https://gorails.com/setup/ubuntu/16.04#ruby-rbenv
```
cd
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
exec $SHELL

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc
exec $SHELL

rbenv install 2.7.1
rbenv global 2.7.1
ruby -v
gem install jekyll bundler
```

Oops, needed to update `markdown: kramdown` in `_config.yml` and that broke all image links.  

I'm not positive, but I think that I needed an update to jb-svbtle.
`yes | rake theme:install git="https://github.com/kevinxueliang/jb-svbtle.git"`
and a fix to `ASSET_PATH : /assets/themes/jb-svbtle`

Sends to port 4000 and now seems to work. *Whew!*
`jekyll serve`

## License
[MIT](http://opensource.org/licenses/MIT)
