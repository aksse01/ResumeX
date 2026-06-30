import unittest

from resume_analyzer import analyze_resume, check_sections, clean_extracted_text, find_skills


class ResumeAnalyzerTests(unittest.TestCase):
    def test_find_skills_matches_multi_word_terms(self):
        skills = find_skills("Built NLP pipelines with Python, SQL, and machine learning.")

        self.assertIn("python", skills)
        self.assertIn("sql", skills)
        self.assertIn("machine learning", skills)
        self.assertIn("nlp", skills)

    def test_analyze_resume_reports_missing_skills(self):
        result = analyze_resume(
            "Experience building Python APIs with Flask and SQL.",
            "Looking for Python, React, SQL, and AWS experience.",
        )

        self.assertGreater(result.score, 0)
        self.assertIn("python", result.matched_skills)
        self.assertIn("sql", result.matched_skills)
        self.assertIn("react", result.missing_skills)
        self.assertIn("aws", result.missing_skills)

    def test_check_sections_detects_common_resume_sections(self):
        sections = check_sections(
            "Education\nB.Tech\nExperience\nSoftware Intern\nProjects\nResume parser"
        )

        self.assertTrue(sections["education"])
        self.assertTrue(sections["experience"])
        self.assertTrue(sections["projects"])
        self.assertFalse(sections["certifications"])

    def test_clean_extracted_text_removes_pdf_cid_artifacts(self):
        cleaned = clean_extracted_text("Name\n(cid:131) phone (cid:239) link")

        self.assertNotIn("cid:", cleaned)
        self.assertIn("phone", cleaned)

    def test_find_skills_matches_common_variants(self):
        skills = find_skills("React.js dashboards, data analytics, and problem-solving presentations")

        self.assertIn("react", skills)
        self.assertIn("data analysis", skills)
        self.assertIn("problem solving", skills)
        self.assertIn("communication", skills)

    def test_analysis_includes_section_feedback_and_export(self):
        result = analyze_resume(
            "Aaditya Sengar\nSkills\nPython SQL Git\nExperience\n- Improved dashboard speed by 20%.\nProjects\nSales dashboard\nEducation\nBTech",
            "Need Python, SQL, Git, communication, and dashboard experience.",
        )

        self.assertTrue(result.section_feedback)
        self.assertIn("TARGETED PROFESSIONAL SUMMARY", result.improved_resume)
        self.assertIn("ATS KEYWORDS TO INCLUDE", result.improved_resume)


if __name__ == "__main__":
    unittest.main()
