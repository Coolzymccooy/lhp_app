import { describe, it, expect } from 'vitest';
import { GALLERY_ALBUMS, DEFAULT_ALBUM, RETIRED_ALBUMS, isGalleryAlbum, resolveAlbum } from './albums';

describe('gallery albums', () => {
  it('exposes a closed, non-empty list containing the default', () => {
    expect(GALLERY_ALBUMS.length).toBeGreaterThan(0);
    expect(GALLERY_ALBUMS).toContain(DEFAULT_ALBUM);
  });

  it('has no duplicate album names', () => {
    expect(new Set(GALLERY_ALBUMS).size).toBe(GALLERY_ALBUMS.length);
  });

  it('recognises known albums and rejects anything else', () => {
    expect(isGalleryAlbum('Sunday Service')).toBe(true);
    expect(isGalleryAlbum('sunday service')).toBe(false);
    expect(isGalleryAlbum('Wedding Photos')).toBe(false);
    expect(isGalleryAlbum(undefined)).toBe(false);
    expect(isGalleryAlbum(42)).toBe(false);
  });

  it('resolves a missing or blank album to the default', () => {
    expect(resolveAlbum(undefined)).toBe(DEFAULT_ALBUM);
    expect(resolveAlbum('')).toBe(DEFAULT_ALBUM);
    expect(resolveAlbum('   ')).toBe(DEFAULT_ALBUM);
  });

  it('resolves a known album to itself, trimming surrounding space', () => {
    expect(resolveAlbum('Evangelism')).toBe('Evangelism');
    expect(resolveAlbum('  Youth Church  ')).toBe('Youth Church');
  });

  it('returns null for an unknown album so callers can reject it', () => {
    expect(resolveAlbum('Wedding Photos')).toBeNull();
  });
});

describe('retired albums', () => {
  it('maps every retired name to a current album, and is no longer offered', () => {
    for (const [oldName, newName] of Object.entries(RETIRED_ALBUMS)) {
      expect(isGalleryAlbum(newName)).toBe(true);
      expect(isGalleryAlbum(oldName)).toBe(false);
    }
  });

  it('rejects a retired album on upload so it cannot come back', () => {
    expect(resolveAlbum('Teen Fellowship')).toBeNull();
    expect(resolveAlbum('Young Adults')).toBeNull();
  });
});
