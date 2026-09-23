// ─── Pre-configured starter code & function signatures for standard problems ───

const templates = {
  'two-sum': {
    JAVA: `import java.util.*;

public class Solution {
    /**
     * Complete the function below.
     * Finds two numbers in nums that add up to target.
     * @return 0-indexed array containing the two indices
     */
    public int[] twoSum(int[] nums, int target) {
        // TODO: Write your logic here
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{ map.get(complement), i };
            }
            map.put(nums[i], i);
        }
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
        if (result.length == 2) {
            System.out.println(result[0] + " " + result[1]);
        }
    }
}`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: Write your logic here
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (mp.count(comp)) return {mp[comp], i};
            mp[nums[i]] = i;
        }
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
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # TODO: Write your logic here
        seen = {}
        for i, num in enumerate(nums):
            comp = target - num
            if comp in seen:
                return [seen[comp], i]
            seen[num] = i
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
    public boolean isPalindrome(int x) {
        // TODO: Write your logic here
        if (x < 0) return false;
        long rev = 0, temp = x;
        while (temp > 0) {
            rev = rev * 10 + temp % 10;
            temp /= 10;
        }
        return rev == x;
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
        if (x < 0) return false;
        long long rev = 0, temp = x;
        while (temp > 0) {
            rev = rev * 10 + temp % 10;
            temp /= 10;
        }
        return rev == x;
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
        if x < 0: return False
        s = str(x)
        return s == s[::-1]

if __name__ == '__main__':
    val = sys.stdin.read().strip()
    if val:
        print("true" if Solution().isPalindrome(int(val)) else "false")
`
  },

  'valid-parentheses': {
    JAVA: `import java.util.*;

public class Solution {
    public boolean isValid(String s) {
        // TODO: Write your logic here (Stack)
        Stack<Character> st = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();
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
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else {
                if (st.empty() || st.top() != c) return false;
                st.pop();
            }
        }
        return st.empty();
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
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping.values():
                stack.append(char)
            elif char in mapping:
                if not stack or stack.pop() != mapping[char]:
                    return False
        return len(stack) == 0

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    if s:
        print("true" if Solution().isValid(s) else "false")
`
  },

  'reverse-string': {
    JAVA: `import java.util.*;

public class Solution {
    public String reverseString(String s) {
        // TODO: Write your logic here
        return new StringBuilder(s).reverse().toString();
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
        reverse(s.begin(), s.end());
        return s;
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
        return s[::-1]

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    if s:
        print(Solution().reverseString(s))
`
  },

  'maximum-subarray': {
    JAVA: `import java.util.*;

public class Solution {
    public int maxSubArray(int[] nums) {
        // TODO: Write your logic here (Kadane's Algorithm)
        int maxSoFar = nums[0], currMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currMax = Math.max(nums[i], currMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currMax);
        }
        return maxSoFar;
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
        int maxSoFar = nums[0], currMax = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            currMax = max(nums[i], currMax + nums[i]);
            maxSoFar = max(maxSoFar, currMax);
        }
        return maxSoFar;
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
        max_so_far = curr_max = nums[0]
        for x in nums[1:]:
            curr_max = max(x, curr_max + x)
            max_so_far = max(max_so_far, curr_max)
        return max_so_far

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
    public int singleNumber(int[] nums) {
        // TODO: Write your logic here
        int res = 0;
        for (int x : nums) res ^= x;
        return res;
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
        int res = 0;
        for (int x : nums) res ^= x;
        return res;
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
        res = 0
        for x in nums: res ^= x
        return res

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
    public boolean containsDuplicate(int[] nums) {
        // TODO: Write your logic here
        Set<Integer> set = new HashSet<>();
        for (int x : nums) {
            if (!set.add(x)) return true;
        }
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
        unordered_set<int> st;
        for (int x : nums) {
            if (st.count(x)) return true;
            st.insert(x);
        }
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
        return len(nums) != len(set(nums))

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
    public int lengthOfLongestSubstring(String s) {
        // TODO: Write your logic here (Sliding Window)
        int[] last = new int[256];
        Arrays.fill(last, -1);
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (last[c] >= left) {
                left = last[c] + 1;
            }
            last[c] = right;
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
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
        vector<int> last(256, -1);
        int maxLen = 0, left = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            unsigned char c = s[right];
            if (last[c] >= left) left = last[c] + 1;
            last[c] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
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
        last = {}
        max_len = left = 0
        for right, char in enumerate(s):
            if char in last and last[char] >= left:
                left = last[char] + 1
            last[char] = right
            max_len = max(max_len, right - left + 1)
        return max_len

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print(Solution().lengthOfLongestSubstring(s) if s else 0)
`
  },

  'container-with-most-water': {
    JAVA: `import java.util.*;

public class Solution {
    public int maxArea(int[] height) {
        // TODO: Write your logic here (Two Pointers)
        int left = 0, right = height.length - 1;
        int maxWater = 0;
        while (left < right) {
            int w = right - left;
            int h = Math.min(height[left], height[right]);
            maxWater = Math.max(maxWater, w * h);
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
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
        int l = 0, r = height.size() - 1, ans = 0;
        while (l < r) {
            ans = max(ans, (r - l) * min(height[l], height[r]));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return ans;
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
        l, r = 0, len(height) - 1
        ans = 0
        while l < r:
            ans = max(ans, (r - l) * min(height[l], height[r]))
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return ans

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
    public int countThreeSum(int[] nums) {
        Arrays.sort(nums);
        int count = 0;
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    count++;
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return count;
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
        sort(nums.begin(), nums.end());
        int count = 0, n = nums.size();
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = n - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    count++;
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return count;
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
        nums.sort()
        count, n = 0, len(nums)
        for i in range(n - 2):
            if i > 0 and nums[i] == nums[i - 1]: continue
            l, r = i + 1, n - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s == 0:
                    count += 1
                    while l < r and nums[l] == nums[l + 1]: l += 1
                    while l < r and nums[r] == nums[r - 1]: r -= 1
                    l += 1; r -= 1
                elif s < 0: l += 1
                else: r -= 1
        return count

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
    public int[][] merge(int[][] intervals) {
        // TODO: Write your logic here
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        int[] curr = intervals[0];
        merged.add(curr);
        for (int[] interval : intervals) {
            if (interval[0] <= curr[1]) {
                curr[1] = Math.max(curr[1], interval[1]);
            } else {
                curr = interval;
                merged.add(curr);
            }
        }
        return merged.toArray(new int[merged.size()][]);
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
        if (intervals.empty()) return {};
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> res;
        res.push_back(intervals[0]);
        for (size_t i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] <= res.back()[1]) {
                res.back()[1] = max(res.back()[1], intervals[i][1]);
            } else {
                res.push_back(intervals[i]);
            }
        }
        return res;
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
        if not intervals: return []
        intervals.sort(key=lambda x: x[0])
        res = [intervals[0]]
        for start, end in intervals[1:]:
            if start <= res[-1][1]:
                res[-1][1] = max(res[-1][1], end)
            else:
                res.append([start, end])
        return res

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
    public int search(int[] nums, int target) {
        // TODO: Write your logic here (Binary Search O(log N))
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
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
        int l = 0, r = nums.size() - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
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
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = (l + r) // 2
            if nums[mid] == target: return mid
            if nums[l] <= nums[mid]:
                if nums[l] <= target < nums[mid]: r = mid - 1
                else: l = mid + 1
            else:
                if nums[mid] < target <= nums[r]: l = mid + 1
                else: r = mid - 1
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
    public int numIslands(char[][] grid) {
        // TODO: Write your logic here (DFS/BFS)
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }

    private void dfs(char[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';
        dfs(g, r + 1, c);
        dfs(g, r - 1, c);
        dfs(g, r, c + 1);
        dfs(g, r, c - 1);
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
    void dfs(vector<vector<char>>& g, int r, int c) {
        if (r < 0 || c < 0 || r >= (int)g.size() || c >= (int)g[0].size() || g[r][c] != '1') return;
        g[r][c] = '0';
        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
    }

    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int r = 0; r < (int)grid.size(); r++) {
            for (int c = 0; c < (int)grid[0].size(); c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
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
        if not grid: return 0
        m, n = len(grid), len(grid[0])
        count = 0

        def dfs(r, c):
            if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] != '1':
                return
            grid[r][c] = '0'
            dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)

        for r in range(m):
            for c in range(n):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
        return count

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
    public int coinChange(int[] coins, int amount) {
        // TODO: Write your logic here (DP)
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int coin : coins) {
            for (int i = coin; i <= amount; i++) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
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
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int c : coins) {
            for (int i = c; i <= amount; i++) {
                dp[i] = min(dp[i], dp[i - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
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
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        for c in coins:
            for i in range(c, amount + 1):
                dp[i] = min(dp[i], dp[i - c] + 1)
        return dp[amount] if dp[amount] != float('inf') else -1

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
    public int longestConsecutive(int[] nums) {
        // TODO: Write your logic here O(N)
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int longest = 0;
        for (int x : set) {
            if (!set.contains(x - 1)) {
                int curr = x, streak = 1;
                while (set.contains(curr + 1)) {
                    curr++; streak++;
                }
                longest = Math.max(longest, streak);
            }
        }
        return longest;
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
        unordered_set<int> st(nums.begin(), nums.end());
        int longest = 0;
        for (int x : st) {
            if (!st.count(x - 1)) {
                int curr = x, streak = 1;
                while (st.count(curr + 1)) { curr++; streak++; }
                longest = max(longest, streak);
            }
        }
        return longest;
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
        s = set(nums)
        longest = 0
        for x in s:
            if x - 1 not in s:
                curr, streak = x, 1
                while curr + 1 in s:
                    curr += 1; streak += 1
                longest = max(longest, streak)
        return longest

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
    public int[] topKFrequent(int[] nums, int k) {
        // TODO: Write your logic here
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.put(x, count.getOrDefault(x, 0) + 1);
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        for (var entry : count.entrySet()) {
            pq.offer(new int[]{entry.getKey(), entry.getValue()});
            if (pq.size() > k) pq.poll();
        }
        int[] res = new int[k];
        for (int i = k - 1; i >= 0; i--) res[i] = pq.poll()[0];
        return res;
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
        unordered_map<int, int> mp;
        for (int x : nums) mp[x]++;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        for (auto& [num, cnt] : mp) {
            pq.push({cnt, num});
            if (pq.size() > (size_t)k) pq.pop();
        }
        vector<int> res(k);
        for (int i = k - 1; i >= 0; i--) {
            res[i] = pq.top().second;
            pq.pop();
        }
        return res;
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
from collections import Counter

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        counts = Counter(nums)
        return [item[0] for item in counts.most_common(k)]

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
    public int trap(int[] height) {
        // TODO: Write your logic here (Two Pointers O(N))
        int l = 0, r = height.length - 1;
        int leftMax = 0, rightMax = 0, total = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= leftMax) leftMax = height[l];
                else total += leftMax - height[l];
                l++;
            } else {
                if (height[r] >= rightMax) rightMax = height[r];
                else total += rightMax - height[r];
                r--;
            }
        }
        return total;
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
        int l = 0, r = height.size() - 1;
        int leftMax = 0, rightMax = 0, total = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= leftMax) leftMax = height[l];
                else total += leftMax - height[l];
                l++;
            } else {
                if (height[r] >= rightMax) rightMax = height[r];
                else total += rightMax - height[r];
                r--;
            }
        }
        return total;
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
        l, r = 0, len(height) - 1
        left_max = right_max = total = 0
        while l < r:
            if height[l] < height[r]:
                if height[l] >= left_max: left_max = height[l]
                else: total += left_max - height[l]
                l += 1
            else:
                if height[r] >= right_max: right_max = height[r]
                else: total += right_max - height[r]
                r -= 1
        return total

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
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // TODO: Write your logic here
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.length, n = nums2.length;
        int low = 0, high = m;
        while (low <= high) {
            int i = (low + high) / 2;
            int j = (m + n + 1) / 2 - i;
            int maxLeftA = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int minRightA = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int maxLeftB = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int minRightB = (j == n) ? Integer.MAX_VALUE : nums2[j];

            if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
                if ((m + n) % 2 == 0) {
                    return (Math.max(maxLeftA, maxLeftB) + Math.min(minRightA, minRightB)) / 2.0;
                } else {
                    return Math.max(maxLeftA, maxLeftB);
                }
            } else if (maxLeftA > minRightB) {
                high = i - 1;
            } else {
                low = i + 1;
            }
        }
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
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int low = 0, high = m;
        while (low <= high) {
            int i = (low + high) / 2;
            int j = (m + n + 1) / 2 - i;
            int maxLeftA = (i == 0) ? INT_MIN : nums1[i - 1];
            int minRightA = (i == m) ? INT_MAX : nums1[i];
            int maxLeftB = (j == 0) ? INT_MIN : nums2[j - 1];
            int minRightB = (j == n) ? INT_MAX : nums2[j];

            if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
                if ((m + n) % 2 == 0)
                    return (max(maxLeftA, maxLeftB) + min(minRightA, minRightB)) / 2.0;
                else
                    return max(maxLeftA, maxLeftB);
            } else if (maxLeftA > minRightB) high = i - 1;
            else low = i + 1;
        }
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
        merged = sorted(nums1 + nums2)
        l = len(merged)
        if l % 2 == 1:
            return float(merged[l // 2])
        return (merged[l // 2 - 1] + merged[l // 2]) / 2.0

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
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // TODO: Write your logic here (BFS)
        Set<String> dict = new HashSet<>(wordList);
        if (!dict.contains(endWord)) return 0;
        Queue<String> queue = new LinkedList<>();
        queue.offer(beginWord);
        int level = 1;
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                String curr = queue.poll();
                char[] chars = curr.toCharArray();
                for (int j = 0; j < chars.length; j++) {
                    char orig = chars[j];
                    for (char c = 'a'; c <= 'z'; c++) {
                        chars[j] = c;
                        String nextWord = new String(chars);
                        if (nextWord.equals(endWord)) return level + 1;
                        if (dict.remove(nextWord)) {
                            queue.offer(nextWord);
                        }
                    }
                    chars[j] = orig;
                }
            }
            level++;
        }
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
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(endWord)) return 0;
        queue<string> q;
        q.push(beginWord);
        int level = 1;
        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                string curr = q.front(); q.pop();
                for (int j = 0; j < (int)curr.size(); j++) {
                    char orig = curr[j];
                    for (char c = 'a'; c <= 'z'; c++) {
                        curr[j] = c;
                        if (curr == endWord) return level + 1;
                        if (dict.erase(curr)) q.push(curr);
                    }
                    curr[j] = orig;
                }
            }
            level++;
        }
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
from collections import deque

class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        words = set(wordList)
        if endWord not in words: return 0
        q = deque([(beginWord, 1)])
        while q:
            word, dist = q.popleft()
            if word == endWord: return dist
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    next_w = word[:i] + c + word[i+1:]
                    if next_w in words:
                        words.remove(next_w)
                        q.append((next_w, dist + 1))
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
    public int longestValidParentheses(String s) {
        // TODO: Write your logic here
        Stack<Integer> st = new Stack<>();
        st.push(-1);
        int maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                st.push(i);
            } else {
                st.pop();
                if (st.isEmpty()) {
                    st.push(i);
                } else {
                    maxLen = Math.max(maxLen, i - st.peek());
                }
            }
        }
        return maxLen;
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
        stack<int> st;
        st.push(-1);
        int maxLen = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            if (s[i] == '(') st.push(i);
            else {
                st.pop();
                if (st.empty()) st.push(i);
                else maxLen = max(maxLen, i - st.top());
            }
        }
        return maxLen;
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
        stack = [-1]
        max_len = 0
        for i, c in enumerate(s):
            if c == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    max_len = max(max_len, i - stack[-1])
        return max_len

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
