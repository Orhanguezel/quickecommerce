"""Run the real shell orchestration against isolated scraper/php stubs."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

class RunResultTest(unittest.TestCase):
    def run_case(self, scrape_exit, sync_exit):
        source = (Path(__file__).resolve().parents[1] / 'run-all.sh').read_text()
        function = source[source.index('run_scraper() {'):source.index('\n{\n  echo "══')]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'backend-laravel').mkdir()
            (root / 'fake.py').write_text('import json,sys\njson.dump([{"name":"verified fixture","data":"' + 'x'*60 + '"}],open("fixture.json","w"))\nsys.exit(' + str(scrape_exit) + ')\n')
            php = root / 'php'
            php.write_text('#!/bin/bash\nif [[ "$2" == "sync:source-prices" ]]; then exit ' + str(sync_exit) + '; fi\nprintf "%s\\n" "$*" >> "' + str(root / 'record') + '"\n')
            php.chmod(0o755)
            function = function.replace('/var/www/quikecommerce', directory)
            script = 'set -uo pipefail\ncd "' + directory + '"\nONLY_SOURCES=""\nSCRAPER_URL=""\nSCRAPER_API_KEY=""\nLOCAL_SCRAPER_SOURCES=""\nVENV=python3\nFAIL_COUNT=0\nFAIL_LIST=""\nLOG=/dev/null\n' + function + '\nrun_scraper fixture fake.py fixture.json\n'
            result = subprocess.run(['bash', '-c', script], env={**os.environ,'PATH': directory + ':' + os.environ['PATH']},capture_output=True,text=True)
            record = (root / 'record').read_text()
            self.assertEqual(record.count('scrapers:record-run'),1)
            return result.returncode, record

    def test_sync_failure_is_not_recorded_as_success(self):
        code, record = self.run_case(0, 7)
        self.assertEqual(code, 7)
        self.assertIn('--exit-code=7', record)

    def test_scrape_failure_skips_sync(self):
        code, record = self.run_case(3, 0)
        self.assertNotEqual(code, 0)
        self.assertIn('--exit-code=3', record)

    def test_success_after_sync(self):
        code, record = self.run_case(0, 0)
        self.assertEqual(code, 0)
        self.assertIn('--exit-code=0', record)

if __name__ == '__main__': unittest.main()
