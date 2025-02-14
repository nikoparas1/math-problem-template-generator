#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel

load_dotenv(dotenv_path=".env.local")

system_template = """You are a math problem template generator. Your task is to:
1. Analyze the given math problem
2. Identify all numerical values and specific quantities **within the problem text, except any leading problem or question numbers.** (For example, if the problem starts with "5.", leave that number intact.)
3. Replace every numerical value with an appropriate placeholder ({{X}}, {{Y}}, {{Z}}, etc.) in the order they appear, EXCEPT if a number appears at the very beginning followed immediately by a period (which is considered a problem number).
4. Additionally, identify any fractions expressed in words (e.g., "one half", "one third", etc.) and replace them with placeholders as well, following the same sequential order.
5. Identify any numbers that appear in word form (e.g., "ten", "nine", "one", "five", etc.) and replace them with placeholders as well, following the same sequential order.
6. Ensure that no literal numbers or fractional expressions remain in the templated problem aside from the allowed leading problem number.
7. Maintain the overall structure and wording of the original problem.
8. Return only the templated problem.
"""

validation_system_template = """You are a validator for math problem templates. Your task is to:
1. Review the provided templated problem.
2. Ensure that there are no literal numerical values present aside from an optional leading problem number (e.g., "1., 2., 3., 4., etc.").
3. Identify any numbers in word form (e.g., "ten", "nine", "one", "five", etc.) and ensure they have been replaced with sequential placeholders.
4. If any literal numerical values remain, replace them with sequential placeholders (starting with {{X}}, then {{Y}}, etc.) in the order they appear.
5. Return the fully validated templated problem.
"""


# Define a data model for the template metadata
class TemplateData(BaseModel):
    template: str
    gradeLevel: str
    unit: str
    topic: str
    difficulty: str


llm = ChatOpenAI(model="gpt-3.5-turbo", api_key=os.getenv("OPENAI_API_KEY"))
output_parser = StrOutputParser()

primary_prompt = ChatPromptTemplate.from_messages(
    [("system", system_template), ("human", "{problem_text}")]
)
primary_chain = primary_prompt | llm | output_parser

validation_prompt = ChatPromptTemplate.from_messages(
    [("system", validation_system_template), ("human", "{template}")]
)
validation_chain = validation_prompt | llm | output_parser


def generate_template(problem_text: str) -> str:
    try:
        initial_template = primary_chain.invoke({"problem_text": problem_text})

        validated_template = validation_chain.invoke(
            {"template": initial_template.strip()}
        )

        return validated_template.strip()
    except Exception as e:
        raise Exception(f"Template generation failed: {str(e)}")
