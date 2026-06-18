from django.test import TestCase

class SampleTestCase(TestCase):
    def test_sample1(self):
        self.assertEqual(1 + 2, 3)