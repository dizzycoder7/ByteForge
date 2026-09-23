// ─── Clean Starter Templates (Blank Method Signatures for Students) ───

const templates = {
  'two-sum': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param nums array of integers
     * @param target target integer sum
     * @return 0-indexed array containing the two indices
     */
    public int[] twoSum(int[] nums, int target) {
        // TODO: Write your logic here

        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        int[] result = new Solution().twoSum(nums, target);
        if (result != null && result.length == 2) {
            System.out.println(result[0] + " " + result[1]);
        }
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    /**
     * Complete the function below.
     */
    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: Write your logic here

        return {};
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    Solution sol;
    vector<int> res = sol.twoSum(nums, target);
    if (res.size() == 2) cout << res[0] << " " << res[1] << "\n";
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    """
    Complete the function below.
    """
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # TODO: Write your logic here
        
        return []

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        target = int(tokens[1])
        nums = [int(x) for x in tokens[2:2+n]]
        sol = Solution()
        ans = sol.twoSum(nums, target)
        if len(ans) == 2:
            print(f"{ans[0]} {ans[1]}")
`
  },

  'palindrome-number': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param x integer to check
     * @return true if x is a palindrome, false otherwise
     */
    public boolean isPalindrome(int x) {
        // TODO: Write your logic here

        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int x = sc.nextInt();
        System.out.println(new Solution().isPalindrome(x) ? "true" : "false");
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // TODO: Write your logic here

        return false;
    }
};

int main() {
    int x;
    if (cin >> x) {
        Solution sol;
        cout << (sol.isPalindrome(x) ? "true" : "false") << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def isPalindrome(self, x: int) -> bool:
        # TODO: Write your logic here
        
        return False

if __name__ == '__main__':
    val = sys.stdin.read().strip()
    if val:
        print("true" if Solution().isPalindrome(int(val)) else "false")
`
  },

  'valid-parentheses': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param s bracket string containing '()[]{}'
     * @return true if string is well-formed, false otherwise
     */
    public boolean isValid(String s) {
        // TODO: Write your logic here

        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        System.out.println(new Solution().isValid(s) ? "true" : "false");
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // TODO: Write your logic here

        return false;
    }
};

int main() {
    string s;
    if (cin >> s) {
        cout << (Solution().isValid(s) ? "true" : "false") << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def isValid(self, s: str) -> bool:
        # TODO: Write your logic here
        
        return False

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    if s:
        print("true" if Solution().isValid(s) else "false")
`
  },

  'reverse-string': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param s string to reverse
     * @return reversed string
     */
    public String reverseString(String s) {
        // TODO: Write your logic here

        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        System.out.println(new Solution().reverseString(s));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    string reverseString(string s) {
        // TODO: Write your logic here

        return "";
    }
};

int main() {
    string s;
    if (cin >> s) cout << Solution().reverseString(s) << "\n";
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def reverseString(self, s: str) -> str:
        # TODO: Write your logic here
        
        return ""

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    if s:
        print(Solution().reverseString(s))
`
  },

  'maximum-subarray': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below (Kadane's Algorithm).
     * @param nums integer array
     * @return maximum contiguous subarray sum
     */
    public int maxSubArray(int[] nums) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(new Solution().maxSubArray(nums));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << Solution().maxSubArray(nums) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        nums = [int(x) for x in tokens[1:1+n]]
        print(Solution().maxSubArray(nums))
`
  },

  'single-number': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param nums array where every element appears twice except one
     * @return the single element
     */
    public int singleNumber(int[] nums) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(new Solution().singleNumber(nums));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int singleNumber(vector<int>& nums) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << Solution().singleNumber(nums) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        nums = [int(x) for x in tokens[1:1+n]]
        print(Solution().singleNumber(nums))
`
  },

  'contains-duplicate': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param nums integer array
     * @return true if duplicate exists, false otherwise
     */
    public boolean containsDuplicate(int[] nums) {
        // TODO: Write your logic here

        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(new Solution().containsDuplicate(nums) ? "true" : "false");
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        // TODO: Write your logic here

        return false;
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << (Solution().containsDuplicate(nums) ? "true" : "false") << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        # TODO: Write your logic here
        
        return False

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        nums = [int(x) for x in tokens[1:1+n]]
        print("true" if Solution().containsDuplicate(nums) else "false")
`
  },

  'longest-substring-without-repeating-characters': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below (Sliding Window).
     * @param s input string
     * @return length of longest unique substring
     */
    public int lengthOfLongestSubstring(String s) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) {
            System.out.println(0);
            return;
        }
        String s = sc.next();
        System.out.println(new Solution().lengthOfLongestSubstring(s));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    string s;
    if (cin >> s) {
        cout << Solution().lengthOfLongestSubstring(s) << "\n";
    } else {
        cout << 0 << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print(Solution().lengthOfLongestSubstring(s) if s else 0)
`
  },

  'container-with-most-water': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below (Two Pointers).
     * @param height elevation heights array
     * @return maximum water container area
     */
    public int maxArea(int[] height) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] h = new int[n];
        for (int i = 0; i < n; i++) h[i] = sc.nextInt();
        System.out.println(new Solution().maxArea(h));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<int> h(n);
        for (int i = 0; i < n; i++) cin >> h[i];
        cout << Solution().maxArea(h) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def maxArea(self, height: list[int]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        h = [int(x) for x in tokens[1:1+n]]
        print(Solution().maxArea(h))
`
  },

  'three-sum': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param nums integer array
     * @return count of unique triplets summing to 0
     */
    public int countThreeSum(int[] nums) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(new Solution().countThreeSum(nums));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int countThreeSum(vector<int>& nums) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << Solution().countThreeSum(nums) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def countThreeSum(self, nums: list[int]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        nums = [int(x) for x in tokens[1:1+n]]
        print(Solution().countThreeSum(nums))
`
  },

  'merge-intervals': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param intervals list of [start, end]
     * @return merged overlapping intervals
     */
    public int[][] merge(int[][] intervals) {
        // TODO: Write your logic here

        return new int[0][0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        int[][] res = new Solution().merge(intervals);
        for (int[] iv : res) {
            System.out.println(iv[0] + " " + iv[1]);
        }
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // TODO: Write your logic here

        return {};
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<vector<int>> intervals(n, vector<int>(2));
        for (int i = 0; i < n; i++) cin >> intervals[i][0] >> intervals[i][1];
        auto res = Solution().merge(intervals);
        for (auto& iv : res) cout << iv[0] << " " << iv[1] << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # TODO: Write your logic here
        
        return []

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        intervals = []
        idx = 1
        for _ in range(n):
            intervals.append([int(tokens[idx]), int(tokens[idx+1])])
            idx += 2
        for iv in Solution().merge(intervals):
            print(f"{iv[0]} {iv[1]}")
`
  },

  'search-in-rotated-sorted-array': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below in O(log N) time.
     * @param nums rotated sorted array
     * @param target search target
     * @return 0-based index of target, or -1
     */
    public int search(int[] nums, int target) {
        // TODO: Write your logic here

        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(new Solution().search(nums, target));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        // TODO: Write your logic here

        return -1;
    }
};

int main() {
    int n, target;
    if (cin >> n >> target) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << Solution().search(nums, target) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # TODO: Write your logic here
        
        return -1

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        target = int(tokens[1])
        nums = [int(x) for x in tokens[2:2+n]]
        print(Solution().search(nums, target))
`
  },

  'number-of-islands': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below (BFS / DFS).
     * @param grid 2D binary grid ('1' land, '0' water)
     * @return count of connected islands
     */
    public int numIslands(char[][] grid) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt(), n = sc.nextInt();
        char[][] grid = new char[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = sc.next().charAt(0);
            }
        }
        System.out.println(new Solution().numIslands(grid));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    int m, n;
    if (cin >> m >> n) {
        vector<vector<char>> g(m, vector<char>(n));
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) cin >> g[i][j];
        cout << Solution().numIslands(g) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        m, n = int(tokens[0]), int(tokens[1])
        g = []
        idx = 2
        for _ in range(m):
            g.append(tokens[idx:idx+n])
            idx += n
        print(Solution().numIslands(g))
`
  },

  'coin-change': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below (Dynamic Programming).
     * @param coins available coin denominations
     * @param amount target amount
     * @return minimum coins count, or -1 if not possible
     */
    public int coinChange(int[] coins, int amount) {
        // TODO: Write your logic here

        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt(), amount = sc.nextInt();
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) coins[i] = sc.nextInt();
        System.out.println(new Solution().coinChange(coins, amount));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // TODO: Write your logic here

        return -1;
    }
};

int main() {
    int n, amount;
    if (cin >> n >> amount) {
        vector<int> coins(n);
        for (int i = 0; i < n; i++) cin >> coins[i];
        cout << Solution().coinChange(coins, amount) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        # TODO: Write your logic here
        
        return -1

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n, amount = int(tokens[0]), int(tokens[1])
        coins = [int(x) for x in tokens[2:2+n]]
        print(Solution().coinChange(coins, amount))
`
  },

  'longest-consecutive-sequence': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below in O(N) time.
     * @param nums unsorted integer array
     * @return length of longest consecutive streak
     */
    public int longestConsecutive(int[] nums) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) {
            System.out.println(0); return;
        }
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(new Solution().longestConsecutive(nums));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cout << Solution().longestConsecutive(nums) << "\n";
    } else {
        cout << 0 << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        nums = [int(x) for x in tokens[1:1+n]]
        print(Solution().longestConsecutive(nums))
    else:
        print(0)
`
  },

  'top-k-frequent-elements': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param nums integer array
     * @param k number of top frequent elements to return
     * @return array of k most frequent elements
     */
    public int[] topKFrequent(int[] nums, int k) {
        // TODO: Write your logic here

        return new int[0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt(), k = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int[] ans = new Solution().topKFrequent(nums, k);
        for (int i = 0; i < ans.length; i++) {
            System.out.print(ans[i] + (i == ans.length - 1 ? "\n" : " "));
        }
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        // TODO: Write your logic here

        return {};
    }
};

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        auto res = Solution().topKFrequent(nums, k);
        for (size_t i = 0; i < res.size(); i++) {
            cout << res[i] << (i == res.size() - 1 ? "" : " ");
        }
        cout << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        # TODO: Write your logic here
        
        return []

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n, k = int(tokens[0]), int(tokens[1])
        nums = [int(x) for x in tokens[2:2+n]]
        ans = Solution().topKFrequent(nums, k)
        print(' '.join(map(str, ans)))
`
  },

  'trapping-rain-water': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below (Two Pointers / DP).
     * @param height elevation height map
     * @return total units of trapped rain water
     */
    public int trap(int[] height) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] h = new int[n];
        for (int i = 0; i < n; i++) h[i] = sc.nextInt();
        System.out.println(new Solution().trap(h));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    int n;
    if (cin >> n) {
        vector<int> h(n);
        for (int i = 0; i < n; i++) cin >> h[i];
        cout << Solution().trap(h) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def trap(self, height: list[int]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        h = [int(x) for x in tokens[1:1+n]]
        print(Solution().trap(h))
`
  },

  'median-of-two-sorted-arrays': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below in O(log(M+N)) time.
     * @param nums1 sorted array 1
     * @param nums2 sorted array 2
     * @return median as double
     */
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // TODO: Write your logic here

        return 0.0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt(), n = sc.nextInt();
        int[] nums1 = new int[m];
        for (int i = 0; i < m; i++) nums1[i] = sc.nextInt();
        int[] nums2 = new int[n];
        for (int i = 0; i < n; i++) nums2[i] = sc.nextInt();
        System.out.printf("%.1f\n", new Solution().findMedianSortedArrays(nums1, nums2));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        // TODO: Write your logic here

        return 0.0;
    }
};

int main() {
    int m, n;
    if (cin >> m >> n) {
        vector<int> a(m), b(n);
        for (int i = 0; i < m; i++) cin >> a[i];
        for (int i = 0; i < n; i++) cin >> b[i];
        cout << fixed << setprecision(1) << Solution().findMedianSortedArrays(a, b) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        # TODO: Write your logic here
        
        return 0.0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        m, n = int(tokens[0]), int(tokens[1])
        a = [int(x) for x in tokens[2:2+m]]
        b = [int(x) for x in tokens[2+m:2+m+n]]
        ans = Solution().findMedianSortedArrays(a, b)
        print(f"{ans:.1f}")
`
  },

  'word-ladder': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below (BFS shortest path).
     * @param beginWord starting word
     * @param endWord target word
     * @param wordList dictionary word list
     * @return shortest transformation sequence length, or 0
     */
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String begin = sc.next(), end = sc.next();
        int n = sc.nextInt();
        List<String> dict = new ArrayList<>();
        for (int i = 0; i < n; i++) dict.add(sc.next());
        System.out.println(new Solution().ladderLength(begin, end, dict));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    string b, e;
    int n;
    if (cin >> b >> e >> n) {
        vector<string> words(n);
        for (int i = 0; i < n; i++) cin >> words[i];
        cout << Solution().ladderLength(b, e, words) << "\n";
    }
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    tokens = sys.stdin.read().split()
    if tokens:
        b, e = tokens[0], tokens[1]
        n = int(tokens[2])
        w = tokens[3:3+n]
        print(Solution().ladderLength(b, e, w))
`
  },

  'longest-valid-parentheses': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * @param s bracket string containing '(' and ')'
     * @return length of the longest valid parentheses substring
     */
    public int longestValidParentheses(String s) {
        // TODO: Write your logic here

        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) {
            System.out.println(0); return;
        }
        String s = sc.next();
        System.out.println(new Solution().longestValidParentheses(s));
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int longestValidParentheses(string s) {
        // TODO: Write your logic here

        return 0;
    }
};

int main() {
    string s;
    if (cin >> s) cout << Solution().longestValidParentheses(s) << "\n";
    else cout << 0 << "\n";
    return 0;
}`,
    PYTHON: `import sys

class Solution:
    def longestValidParentheses(self, s: str) -> int:
        # TODO: Write your logic here
        
        return 0

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print(Solution().longestValidParentheses(s) if s else 0)
`
  }
};

const DEFAULT_STARTERS = {
  JAVA: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution logic here
    }
}`,
  CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write your solution logic here
    return 0;
}`,
  PYTHON: `import sys

def main():
    input_data = sys.stdin.read().strip()
    # Write your solution logic here

if __name__ == '__main__':
    main()
`
};

export function getStarterCode(slug, language) {
  if (slug && templates[slug] && templates[slug][language]) {
    return templates[slug][language];
  }
  return DEFAULT_STARTERS[language] || DEFAULT_STARTERS.JAVA;
}

export default templates;
