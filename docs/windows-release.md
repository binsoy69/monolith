# Windows Release Checklist

1. `npm install`
2. `npm run typecheck`
3. `npm run build:unpack`
4. `npm run build:win`
5. Set `GH_TOKEN`
6. Create GitHub Release `v<version>` on `binsoy69/monolith`
7. Upload the NSIS installer plus updater metadata files
8. Install the unsigned NSIS build and confirm the app starts
9. Launch the installed app and confirm it checks for updates on startup

## Notes

- v1 is unsigned. Windows may show a SmartScreen warning before install.
- Publish from the same tagged commit that produced the installer and updater metadata.
