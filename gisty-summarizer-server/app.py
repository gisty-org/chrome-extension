from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
import requests
# from palak import summarizer_util_p
from saif import summarizer_util_sk
# from sarakshi import summarizer_util_sp
import os
from os.path import join, dirname
# from dotenv import load_dotenv

# dotenv_path = join(dirname(__file__), '.env')
# load_dotenv(dotenv_path)

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/text/<user_id>', methods=['POST'])
@cross_origin()
def text(user_id):
    meet_data = request.get_json()
    meet_transcript = meet_data['transcript']
    subject_name = meet_data['subject_name']
    lecture_name = meet_data['lecture_name']
    email = meet_data['email']
    images = meet_data['images']
    is_gmeet = meet_data['is_gmeet']
    num_lines = int(meet_data['num_lines'])
    if images == None:
        images = []
    print(meet_transcript, subject_name, images, num_lines, type(num_lines))
    meet_text = ""
    if not is_gmeet:
        for data in meet_transcript:
            meet_text += data['text']
            meet_text += ". "
    else:
        meet_text = meet_transcript
    # print("==============")
    meet_summary = summarizer_util_sk(meet_text, num_lines)
    # print("==============")
    #print(summarizer_util_p(meet_text, num_lines))
    # print("==============")
    #print(summarizer_util_sp(meet_text, num_lines))
    # print("==============")
    # print(meet_text)
    #meet_text_p = summarizer_util_p(meet_text, num_lines)
    #meet_text_s = summarizer_util(meet_text, num_lines)
    #meet_text_k = summarizer_util(meet_text, num_lines)
    # print(meet_text_p)
    # print("==============")
    # print(meet_text_s)
    # print("==============")
    # print(meet_text_k)
    # print("================")
    data = {
        "email": email,
        "folder": subject_name,
        "title": lecture_name,
        "content": meet_summary,
        "snapshots": images
    }
    print(data)
    headers = {'Content-type': 'application/json'}
    res = requests.post(
        url='https://gisty-server.herokuapp.com/api/summaries/create', data=json.dumps(data), headers=headers)
    print(res.text)

    return jsonify({'msg': 'sucessfully added'}), 200


if __name__ == '__main__':
    app.run(debug=True)
