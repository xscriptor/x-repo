<h1 align="center">Signed Arch Packaging Flow</h1>

<p>This document explains how traditional signed packaging for Arch-style repositories is implemented in this repository and how it is integrated into the CI publish pipeline.</p>

<hr />

<h2>Scope</h2>

<ul>
  <li><b>Pacman endpoint:</b> <code>public/repo/x86_64</code></li>
  <li><b>xpm endpoint:</b> <code>public/x/x86_64</code></li>
  <li><b>Pacman-facing packages:</b> <code>x-release</code> and <code>xpm</code></li>
  <li><b>xpm endpoint policy:</b> Accepts all <code>.xp</code> artifacts produced by the xpkg flow.</li>
</ul>

<p>This split keeps long-term pacman compatibility stable while allowing xpkg-native packages (for example future <code>xfetch</code> flow) to be delivered through <code>x/x86_64</code>.</p>

<hr />

<h2>Signing Material</h2>

<p>The pipeline uses a GPG private key stored as GitHub Actions secrets.</p>

<ul>
  <li><code>X_REPO_GPG_PRIVATE_KEY_B64</code>: Base64-encoded private key file used for signing.</li>
  <li><code>X_REPO_GPG_PASSPHRASE</code>: Passphrase for the private key. Keep empty only if your private key has no passphrase.</li>
  <li><code>X_REPO_GPG_KEY_FPR</code>: Full expected key fingerprint used to pin signing identity in CI.</li>
</ul>

<p>During CI execution, the workflow imports the private key into a temporary <code>GNUPGHOME</code> and exports:</p>

<ul>
  <li><code>trustedkeys.gpg</code> (binary keyring)</li>
  <li><code>signing.pub</code> (ASCII-armored public key)</li>
</ul>

<p>Those files are copied to each published endpoint so clients can bootstrap trust.</p>

<p>Signing is enforced in CI. If signing secrets are missing or the imported key fingerprint does not match <code>X_REPO_GPG_KEY_FPR</code>, the workflow fails.</p>

<hr />

<h2>Traditional Signed Packaging Steps</h2>

<ol>
  <li>Build package artifacts.</li>
  <li>Create repository databases using <code>repo-add</code>.</li>
  <li>Generate detached signatures (<code>.sig</code>) for each package and repository database file.</li>
  <li>Publish the repository key material (<code>trustedkeys.gpg</code> and <code>signing.pub</code>).</li>
</ol>

<p>This repository follows that model in CI for both endpoints.</p>

<hr />

<h2>How Packaging Is Produced In This Repository</h2>

<ul>
  <li><b>x-release:</b> Built from <code>packages/x-release</code> with <code>xpkg build</code>.</li>
  <li><b>xpm:</b> Included from the latest prebuilt <code>.xp</code> artifact present in <code>packages/xpm</code>.</li>
</ul>

<p>After collecting <code>.xp</code> artifacts, the workflow:</p>

<ul>
  <li>Publishes all <code>.xp</code> packages under <code>public/x/x86_64</code>.</li>
  <li>Publishes pacman-style filenames (<code>.pkg.tar.zst</code>) under <code>public/repo/x86_64</code> only for <code>x-release</code> and <code>xpm</code>.</li>
</ul>

<hr />

<h2>Repository Metadata And Signature Coverage</h2>

<p>The workflow signs all critical files for each endpoint:</p>

<ul>
  <li>Package files (<code>.xp</code> or <code>.pkg.tar.zst</code>)</li>
  <li><code>x.db</code> and <code>x.files</code></li>
  <li><code>x.db.tar.gz</code> and <code>x.files.tar.gz</code></li>
</ul>

<p>Each signed file gets a detached signature next to it using the same name plus <code>.sig</code>.</p>

<p>After signing, CI verifies generated signatures before publishing artifacts.</p>

<hr />

<h2>Workflow Integration</h2>

<p>The complete signed flow is implemented in:</p>

<ul>
  <li><code>.github/workflows/build.yml</code></li>
</ul>

<p>High-level sequence:</p>

<ol>
  <li>Install build tools and GnuPG in the Arch container.</li>
  <li>Build <code>x-release</code>.</li>
  <li>Add latest <code>xpm</code> artifact.</li>
  <li>Import signing key from secrets and validate key fingerprint pinning.</li>
  <li>Create repositories for xpm and pacman endpoints with endpoint-specific package policy.</li>
  <li>Sign packages and database files.</li>
  <li>Generate and sign <code>SHA256SUMS</code> per endpoint.</li>
  <li>Verify all signatures in CI.</li>
  <li>Publish keyring files with repository artifacts.</li>
  <li>Upload to Pages deployment artifact.</li>
</ol>

<hr />

<h2>Local Reproduction Example</h2>

<p>The following example shows the traditional signing concept locally:</p>

<pre><code># Example only: run in an environment with repo-add and gpg available

# Build x-release
cd packages/x-release
xpkg build -o /tmp/xpkg-out

# Copy latest xpm artifact
cp "$(ls -1 ../xpm/*.xp | sort -V | tail -n1)" /tmp/xpkg-out/

# Prepare endpoint
mkdir -p /tmp/repo/x86_64
cp /tmp/xpkg-out/*.xp /tmp/repo/x86_64/

# Optional pacman-compatible naming
for pkg in /tmp/repo/x86_64/*.xp; do
  base="$(basename "$pkg" .xp)"
  cp "$pkg" "/tmp/repo/x86_64/$base.pkg.tar.zst"
done

# Build repository database
cd /tmp/repo/x86_64
repo-add -n -R x.db.tar.gz *.pkg.tar.zst
cp x.db.tar.gz x.db
cp x.files.tar.gz x.files

# Sign critical artifacts
for f in *.pkg.tar.zst x.db x.files x.db.tar.gz x.files.tar.gz; do
  gpg --batch --yes --detach-sign --output "$f.sig" "$f"
done

# Export public key material for client bootstrap
gpg --export > trustedkeys.gpg
gpg --armor --export > signing.pub
</code></pre>

<hr />

<h2>Client-Side Trust Model</h2>

<p>Clients should import <code>trustedkeys.gpg</code> (or <code>signing.pub</code>) and set strict signature policy on the consuming side. This allows future installation to fail closed when signatures are missing or invalid.</p>

<p>For pacman consumers, avoid <code>TrustAll</code> in production configurations.</p>

<hr />

<h2>Repository Settings To Enable</h2>

<ul>
  <li>Enable GitHub Pages deployment from GitHub Actions.</li>
  <li>Create required repository secrets: <code>X_REPO_GPG_PRIVATE_KEY_B64</code>, <code>X_REPO_GPG_PASSPHRASE</code>, <code>X_REPO_GPG_KEY_FPR</code>.</li>
  <li>Protect the <code>main</code> branch (required reviews and status checks) so signing/publish path is controlled.</li>
  <li>Restrict who can edit repository secrets and workflow files.</li>
</ul>

<hr />

<h2>Medium-Term Migration Path</h2>

<ol>
  <li>Keep <code>repo/x86_64</code> focused on stable pacman-facing packages: <code>x-release</code> and <code>xpm</code>.</li>
  <li>Move additional xpkg-native packages (such as <code>xfetch</code>) to <code>x/x86_64</code> instead of the pacman endpoint.</li>
  <li>After client bootstrap is complete, switch consumers to strict signature policies.</li>
</ol>
