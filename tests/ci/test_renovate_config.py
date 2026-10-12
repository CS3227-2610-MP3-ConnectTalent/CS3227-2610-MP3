import json
import unittest
from pathlib import Path


class RenovateConfigTests(unittest.TestCase):
    def test_recommended_preset_groups_only_minor_and_patch_updates(self):
        config = json.loads(Path(".github/renovate.json").read_text(encoding="utf-8"))

        self.assertIn("config:recommended", config["extends"])
        self.assertTrue(
            {"group:monorepos", "group:recommended"}.issubset(
                set(config["ignorePresets"])
            )
        )
        grouped_rules = [
            rule for rule in config["packageRules"] if rule.get("groupName")
        ]
        self.assertEqual(len(grouped_rules), 1)
        self.assertEqual(
            set(grouped_rules[0]["matchUpdateTypes"]), {"minor", "patch"}
        )


if __name__ == "__main__":
    unittest.main()
