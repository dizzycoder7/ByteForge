package com.byteforge.config;

import com.byteforge.entity.Difficulty;
import com.byteforge.entity.Problem;
import com.byteforge.entity.TestCase;
import com.byteforge.entity.User;
import com.byteforge.repository.ProblemRepository;
import com.byteforge.repository.TestCaseRepository;
import com.byteforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class PracticeProblemSeeder implements CommandLineRunner {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (problemRepository.count() > 0) {
            log.info("[PracticeProblemSeeder] Practice problems already exist. Count: " + problemRepository.count());
            return;
        }

        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            log.warn("[PracticeProblemSeeder] Admin user not found. Skipping problem seeding.");
            return;
        }

        log.info("[PracticeProblemSeeder] Seeding 20 standard competitive programming problems...");

        // 1. Two Sum
        createProblemWithCases(
            "Two Sum",
            "two-sum",
            Difficulty.EASY,
            "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
            "Line 1: Two space-separated integers N and Target.\nLine 2: N space-separated integers representing nums.",
            "Print the two 0-indexed positions separated by a space.",
            "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
            admin,
            List.of(
                new TC("4 9\n2 7 11 15", "0 1", true),
                new TC("3 6\n3 2 4", "1 2", true),
                new TC("2 6\n3 3", "0 1", false),
                new TC("5 10\n1 3 5 7 9", "1 3", false)
            )
        );

        // 2. Palindrome Number
        createProblemWithCases(
            "Palindrome Number",
            "palindrome-number",
            Difficulty.EASY,
            "Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.",
            "A single integer x.",
            "Print 'true' if x is a palindrome, otherwise print 'false'.",
            "-2^31 <= x <= 2^31 - 1",
            admin,
            List.of(
                new TC("121", "true", true),
                new TC("-121", "false", true),
                new TC("10", "false", false),
                new TC("12321", "true", false)
            )
        );

        // 3. Valid Parentheses
        createProblemWithCases(
            "Valid Parentheses",
            "valid-parentheses",
            Difficulty.EASY,
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.",
            "A single string s containing brackets.",
            "Print 'true' if valid, otherwise print 'false'.",
            "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
            admin,
            List.of(
                new TC("()", "true", true),
                new TC("()[]{}", "true", true),
                new TC("(]", "false", false),
                new TC("([)]", "false", false),
                new TC("{[]}", "true", false)
            )
        );

        // 4. Reverse a String
        createProblemWithCases(
            "Reverse a String",
            "reverse-string",
            Difficulty.EASY,
            "Write a function that reverses a string given as input.",
            "A single non-empty string S.",
            "Print the reversed string.",
            "1 <= S.length <= 10^5",
            admin,
            List.of(
                new TC("hello", "olleh", true),
                new TC("ByteForge", "egroFetyB", true),
                new TC("racecar", "racecar", false),
                new TC("algorithm", "mhtirogla", false)
            )
        );

        // 5. Maximum Subarray
        createProblemWithCases(
            "Maximum Subarray",
            "maximum-subarray",
            Difficulty.EASY,
            "Given an integer array nums, find the subarray with the largest sum, and return its sum (Kadane's Algorithm).",
            "Line 1: An integer N.\nLine 2: N space-separated integers.",
            "Print the maximum contiguous subarray sum.",
            "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
            admin,
            List.of(
                new TC("9\n-2 1 -3 4 -1 2 1 -5 4", "6", true),
                new TC("1\n1", "1", true),
                new TC("5\n5 4 -1 7 8", "23", false),
                new TC("4\n-3 -2 -1 -4", "-1", false)
            )
        );

        // 6. Single Number
        createProblemWithCases(
            "Single Number",
            "single-number",
            Difficulty.EASY,
            "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one (Bitwise XOR).",
            "Line 1: An integer N.\nLine 2: N space-separated integers.",
            "Print the unique single number.",
            "1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4",
            admin,
            List.of(
                new TC("3\n2 2 1", "1", true),
                new TC("5\n4 1 2 1 2", "4", true),
                new TC("1\n1", "1", false),
                new TC("7\n9 3 5 3 9 7 5", "7", false)
            )
        );

        // 7. Contains Duplicate
        createProblemWithCases(
            "Contains Duplicate",
            "contains-duplicate",
            Difficulty.EASY,
            "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
            "Line 1: An integer N.\nLine 2: N space-separated integers.",
            "Print 'true' if duplicate exists, otherwise 'false'.",
            "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
            admin,
            List.of(
                new TC("4\n1 2 3 1", "true", true),
                new TC("4\n1 2 3 4", "false", true),
                new TC("10\n1 1 1 3 3 4 3 2 4 2", "true", false),
                new TC("3\n10 20 30", "false", false)
            )
        );

        // 8. Longest Substring Without Repeating Characters
        createProblemWithCases(
            "Longest Substring Without Repeating Characters",
            "longest-substring-without-repeating-characters",
            Difficulty.MEDIUM,
            "Given a string s, find the length of the longest substring without repeating characters using the Sliding Window technique.",
            "A single string s.",
            "Print the integer length of the longest unique substring.",
            "0 <= s.length <= 5 * 10^4",
            admin,
            List.of(
                new TC("abcabcbb", "3", true),
                new TC("bbbbb", "1", true),
                new TC("pwwkew", "3", false),
                new TC("dvdf", "3", false),
                new TC("abcdef", "6", false)
            )
        );

        // 9. Container With Most Water
        createProblemWithCases(
            "Container With Most Water",
            "container-with-most-water",
            Difficulty.MEDIUM,
            "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
            "Line 1: An integer N.\nLine 2: N space-separated integers representing bar heights.",
            "Print the maximum amount of water a container can store.",
            "2 <= n <= 10^5\n0 <= height[i] <= 10^4",
            admin,
            List.of(
                new TC("9\n1 8 6 2 5 4 8 3 7", "49", true),
                new TC("2\n1 1", "1", true),
                new TC("5\n4 3 2 1 4", "16", false),
                new TC("4\n1 2 4 3", "4", false)
            )
        );

        // 10. 3Sum
        createProblemWithCases(
            "3Sum",
            "three-sum",
            Difficulty.MEDIUM,
            "Given an integer array nums, return the count of all unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
            "Line 1: An integer N.\nLine 2: N space-separated integers.",
            "Print the total count of unique triplets summing to zero.",
            "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
            admin,
            List.of(
                new TC("6\n-1 0 1 2 -1 -4", "2", true),
                new TC("3\n0 1 1", "0", true),
                new TC("3\n0 0 0", "1", false),
                new TC("8\n-2 0 1 1 2 -1 -4 0", "3", false)
            )
        );

        // 11. Merge Intervals
        createProblemWithCases(
            "Merge Intervals",
            "merge-intervals",
            Difficulty.MEDIUM,
            "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and print an array of the non-overlapping intervals that cover all the intervals in the input.",
            "Line 1: An integer N representing interval count.\nNext N lines: Two integers 'start end' per line.",
            "Print each merged interval on a new line formatted as 'start end'.",
            "1 <= intervals.length <= 10^4\n0 <= starti <= endi <= 10^4",
            admin,
            List.of(
                new TC("4\n1 3\n2 6\n8 10\n15 18", "1 6\n8 10\n15 18", true),
                new TC("2\n1 4\n4 5", "1 5", true),
                new TC("3\n1 4\n0 4\n3 5", "0 5", false),
                new TC("3\n1 4\n2 3\n5 7", "1 4\n5 7", false)
            )
        );

        // 12. Search in Rotated Sorted Array
        createProblemWithCases(
            "Search in Rotated Sorted Array",
            "search-in-rotated-sorted-array",
            Difficulty.MEDIUM,
            "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums in O(log N) time.",
            "Line 1: Two integers N and Target.\nLine 2: N space-separated integers.",
            "Print the 0-based index of target, or -1 if not present.",
            "1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.",
            admin,
            List.of(
                new TC("7 0\n4 5 6 7 0 1 2", "4", true),
                new TC("7 3\n4 5 6 7 0 1 2", "-1", true),
                new TC("1 0\n1", "-1", false),
                new TC("5 1\n3 4 5 1 2", "3", false)
            )
        );

        // 13. Number of Islands
        createProblemWithCases(
            "Number of Islands",
            "number-of-islands",
            Difficulty.MEDIUM,
            "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands using BFS/DFS.",
            "Line 1: Two integers M and N.\nNext M lines: N space-separated characters ('1' or '0').",
            "Print the total count of connected land islands.",
            "1 <= m, n <= 300\ngrid[i][j] is '0' or '1'.",
            admin,
            List.of(
                new TC("4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", "1", true),
                new TC("4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", "3", true),
                new TC("3 3\n1 0 1\n0 1 0\n1 0 1", "5", false),
                new TC("2 2\n0 0\n0 0", "0", false)
            )
        );

        // 14. Coin Change
        createProblemWithCases(
            "Coin Change",
            "coin-change",
            Difficulty.MEDIUM,
            "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount, or -1 if impossible.",
            "Line 1: Two integers N and Amount.\nLine 2: N space-separated coin values.",
            "Print the minimum number of coins needed, or -1.",
            "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
            admin,
            List.of(
                new TC("3 11\n1 2 5", "3", true),
                new TC("1 3\n2", "-1", true),
                new TC("1 0\n1", "0", false),
                new TC("4 15\n2 3 5 7", "3", false)
            )
        );

        // 15. Longest Consecutive Sequence
        createProblemWithCases(
            "Longest Consecutive Sequence",
            "longest-consecutive-sequence",
            Difficulty.MEDIUM,
            "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence in O(n) time.",
            "Line 1: An integer N.\nLine 2: N space-separated integers.",
            "Print the length of the longest consecutive elements sequence.",
            "0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
            admin,
            List.of(
                new TC("6\n100 4 200 1 3 2", "4", true),
                new TC("10\n0 3 7 2 5 8 4 6 0 1", "9", true),
                new TC("0", "0", false),
                new TC("5\n9 1 4 7 3", "1", false)
            )
        );

        // 16. Top K Frequent Elements
        createProblemWithCases(
            "Top K Frequent Elements",
            "top-k-frequent-elements",
            Difficulty.MEDIUM,
            "Given an integer array nums and an integer k, return the k most frequent elements in descending order of frequency.",
            "Line 1: Two integers N and K.\nLine 2: N space-separated integers.",
            "Print the k most frequent integers separated by space.",
            "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
            admin,
            List.of(
                new TC("6 2\n1 1 1 2 2 3", "1 2", true),
                new TC("1 1\n1", "1", true),
                new TC("7 3\n4 4 4 2 2 1 1", "4 2 1", false),
                new TC("5 2\n5 5 9 9 9", "9 5", false)
            )
        );

        // 17. Trapping Rain Water
        createProblemWithCases(
            "Trapping Rain Water",
            "trapping-rain-water",
            Difficulty.HARD,
            "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
            "Line 1: An integer N.\nLine 2: N space-separated integers representing elevation heights.",
            "Print the total units of trapped rain water.",
            "1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
            admin,
            List.of(
                new TC("12\n0 1 0 2 1 0 1 3 2 1 2 1", "6", true),
                new TC("6\n4 2 0 3 2 5", "9", true),
                new TC("3\n3 0 2", "2", false),
                new TC("5\n5 4 3 2 1", "0", false)
            )
        );

        // 18. Median of Two Sorted Arrays
        createProblemWithCases(
            "Median of Two Sorted Arrays",
            "median-of-two-sorted-arrays",
            Difficulty.HARD,
            "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log (m+n)) time.",
            "Line 1: Two integers M and N.\nLine 2: M space-separated integers for nums1.\nLine 3: N space-separated integers for nums2.",
            "Print the median formatted to 1 decimal place (e.g. 2.0 or 2.5).",
            "0 <= m, n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6",
            admin,
            List.of(
                new TC("2 1\n1 3\n2", "2.0", true),
                new TC("2 2\n1 2\n3 4", "2.5", true),
                new TC("1 4\n0 0\n0 0 0", "0.0", false),
                new TC("2 3\n1 5\n2 3 4", "3.0", false)
            )
        );

        // 19. Word Ladder
        createProblemWithCases(
            "Word Ladder",
            "word-ladder",
            Difficulty.HARD,
            "Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no sequence exists.",
            "Line 1: Two strings beginWord and endWord.\nLine 2: An integer D (dictionary word count).\nLine 3: D space-separated words.",
            "Print the minimum transformation path length, or 0.",
            "1 <= beginWord.length <= 10\n1 <= wordList.length <= 5000",
            admin,
            List.of(
                new TC("hit cog\n6\nhot dot dog lot log cog", "5", true),
                new TC("hit cog\n5\nhot dot dog lot log", "0", true),
                new TC("a c\n3\na b c", "2", false),
                new TC("game tree\n4\ngate gare tare tree", "5", false)
            )
        );

        // 20. Longest Valid Parentheses
        createProblemWithCases(
            "Longest Valid Parentheses",
            "longest-valid-parentheses",
            Difficulty.HARD,
            "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
            "A single string S containing only '(' and ')'.",
            "Print the maximum length of a valid substring.",
            "0 <= s.length <= 3 * 10^4",
            admin,
            List.of(
                new TC("(()", "2", true),
                new TC(")()())", "4", true),
                new TC("", "0", false),
                new TC("()(()", "2", false),
                new TC("(()())", "6", false)
            )
        );

        log.info("[PracticeProblemSeeder] Successfully seeded all 20 practice problems with sample & hidden test cases!");
    }

    private void createProblemWithCases(
            String title,
            String slug,
            Difficulty difficulty,
            String description,
            String inputFormat,
            String outputFormat,
            String constraints,
            User author,
            List<TC> testCases
    ) {
        Problem problem = Problem.builder()
                .title(title)
                .slug(slug)
                .difficulty(difficulty)
                .description(description)
                .inputFormat(inputFormat)
                .outputFormat(outputFormat)
                .constraints(constraints)
                .timeLimitMs(2000)
                .memoryLimitMb(256)
                .author(author)
                .published(true)
                .deleted(false)
                .build();

        Problem saved = problemRepository.save(problem);

        List<TestCase> tcEntities = new ArrayList<>();
        int order = 1;
        for (TC tc : testCases) {
            tcEntities.add(TestCase.builder()
                    .problem(saved)
                    .inputData(tc.input)
                    .expectedOutput(tc.expected)
                    .sample(tc.isSample)
                    .orderIndex(order++)
                    .build());
        }
        testCaseRepository.saveAll(tcEntities);
    }

    private record TC(String input, String expected, boolean isSample) {}
}
