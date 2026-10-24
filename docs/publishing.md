# Publishing tracyosborn.com

## Prepared setup

`.github/workflows/publish.yml` builds the Astro site on pushes to `master`, pull requests targeting `master`, and manual runs. It uses Node 24 from `.nvmrc` and `npm ci` with the committed lockfile.

Every run builds `dist/`, checks all migrated URLs, articles, images, archive coverage, and publishing files, then uploads the checked output as the `github-pages` artifact. Preservation checks compare the site with a fixed checkout of the original published HTML; they fail if that baseline is missing. Only `dist/` is uploaded, never the source folder or the original site's checkout.

**Pushes and pull requests do not deploy.** Deployment runs only when someone manually runs the workflow on `master` with **Replace the live site at tracyosborn.com** checked. A default manual run builds and checks only. The deploy job waits for the build to pass and uses GitHub's Pages environment and short-lived deployment token. No new personal token or hosting account is required.

This preparation has not changed GitHub Pages settings, DNS, Cloudflare settings, or the live site.

## First launch

1. Review and commit the Astro rebuild, assets, lockfile, `.nvmrc`, verification scripts, and workflow to `tracymakes/limedaring-website`. Keep unrelated local files such as `.profile` out of the commit. Push to `master` and confirm **Build and publish website** passes in the repository's Actions tab. That run does not publish.
2. Confirm the current `gh-pages` revision is still the rollback revision listed below. Record a new revision if someone has updated the live site since this preparation.
3. In **Settings → Pages**, change **Source** from **Deploy from a branch** to **GitHub Actions**. Keep the existing custom domain **tracyosborn.com**. Do not change DNS, nameservers, or email records. This is a launch-time step, not part of saving the prepared workflow.
4. In **Actions → Build and publish website → Run workflow**, select `master`, check **Replace the live site at tracyosborn.com**, and run it. The deploy job publishes only after all checks pass.
5. Check `https://tracyosborn.com/`, `/articles/`, a topic archive, a normal article, an imported article, an image, `/rss.xml`, and a nonexistent URL. Confirm old article URLs still open and HTTPS works. Also check the site's behavior at `www.tracyosborn.com` if that address was previously supported. If old pages remain visible, inspect Cloudflare caching and purge the website cache only if needed.

The Astro `site` URL is already `https://tracyosborn.com`; do not add a repository-name base path. Keep the domain configured in GitHub Pages Settings: custom-workflow deployments use that setting, rather than relying on the copied `CNAME` file.

## Later updates

Edit locally, preview, then commit and push the approved changes to `master`. GitHub runs the checks automatically. To publish, manually run the workflow on `master` with the publish option checked. Automatic deployment on every push can be enabled later if desired; it is intentionally not enabled for this migration.

## Rollback

The original site was served from `gh-pages` at commit:

`f495e871d4663f66a1226988d82a5bfb74ff236f`

This was read from GitHub on October 24, 2026. The workflow never pushes to or rewrites `gh-pages`.

To restore the original site after launch, change **Settings → Pages → Source** back to **Deploy from a branch**, choose **gh-pages**, and select **/ (root)**. Keep the custom domain set to **tracyosborn.com**. Confirm the branch still points to the recorded revision before switching. Check the public site after GitHub finishes publishing; Cloudflare's cached pages may also need refreshing.

For subsequent Astro releases, revert the source change on `master`, let checks pass, and manually publish the reverted version.

## Verification notes

The workflow compares against the original published HTML by checking out that fixed revision into `.build/`. Local `npm run verify` uses the existing `.build/` folder by default. `LEGACY_BUILD_DIR` can point it to another baseline checkout; `REQUIRE_LEGACY_BASELINE=true` makes a missing baseline fail the checks, as it does in the workflow.

Three already-broken historical links are reported as warnings. They do not block publishing and were preserved with the articles. The old Cactus `make deploy` command must not be used for the Astro site.

References: [Astro's GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/), [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom-domain settings](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
