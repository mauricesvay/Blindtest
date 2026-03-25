const Songs = require('./Songs');

// Mock the dependencies
jest.mock('../lib/Deezer');
jest.mock('../data/1960-2018.json', () => [
  { year: 1960, artist: 'Artist1', title: 'Song1' },
  { year: 1961, artist: 'Artist2', title: 'Song2' }
]);

describe('Songs', () => {
  describe('shuffle', () => {
    test('should shuffle an array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = Songs.shuffle([...original]);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).toEqual(expect.arrayContaining(original));
    });
  });

  describe('suggestionsAreRelevant', () => {
    test('should return true if less than 25% are karaoke', () => {
      const suggestions = [
        { name: 'Song1' },
        { name: 'Song2' },
        { name: 'Song3' },
        { name: 'Karaoke Song' }
      ];

      const result = Songs.suggestionsAreRelevant(suggestions);

      expect(result).toBe(true);
    });

    test('should return false if more than 25% are karaoke', () => {
      const suggestions = [
        { name: 'Karaoke1' },
        { name: 'Karaoke2' },
        { name: 'Song1' },
        { name: 'Song2' }
      ];

      const result = Songs.suggestionsAreRelevant(suggestions);

      expect(result).toBe(false);
    });
  });

  // Note: getRandomSongFromDB is harder to test without mocking more deeply
  // It calls getTrack which is not exported, and involves async operations
});