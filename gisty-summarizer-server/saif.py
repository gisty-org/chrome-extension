import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
import sys
from heapq import nlargest

#nlp = spacy.load('en_core_web_sm')
import en_core_web_md
nlp = en_core_web_md.load()
stopwords = list(STOP_WORDS)
# print(stopwords)


def calc_word_frequencies(doc):
    # print(type(doc))
    word_frequencies = {}
    for word in doc:
        if word.text not in stopwords and word.text not in punctuation:
            if word.text not in word_frequencies.keys():
                word_frequencies[word.text] = 1
            else:
                word_frequencies[word.text] += 1
    return word_frequencies


def get_max_frequency(word_frequencies):
    return max(word_frequencies.values())


def normalize_word_frequencies(word_frequencies):
    max_frequency = get_max_frequency(word_frequencies)
    for word in word_frequencies.keys():
        word_frequencies[word] = (word_frequencies[word]/max_frequency)
    return word_frequencies


def get_sent_scores(sentence_list, word_frequencies):
    sentence_scores = {}
    for i, sent in enumerate(sentence_list):
        for word in sent:
            if word.text in word_frequencies.keys():
                if sent not in sentence_scores.keys():
                    sentence_scores[sent] = [word_frequencies[word.text], i]
                else:
                    sentence_scores[sent][0] += word_frequencies[word.text]
    return sentence_scores


def summarizer_util_sk(file_data, sents_in_summary):
    #print('sents_in_summary: ', type(sents_in_summary))
    #file = open(file_name, "r")
    #file_data = file.readlines()
    # print("=======================")
    # file_data="""hellodddddddddddddddddddddddddddddddddddddddddddd.fbgnfnejdncs.wegern"""
    doc = nlp(file_data)
    if sents_in_summary == -1:
        sents_in_summary = Math.sqrt(len(sent_tokenize(file_data)))
    word_frequencies = calc_word_frequencies(doc)
    word_frequencies = normalize_word_frequencies(word_frequencies)
    sentence_scores = get_sent_scores(
        [sent for sent in doc.sents], word_frequencies)

    # sorting according to decreasing order of importance and choosing the first (sents_in_summary) sentences
    summarized_sentences = sorted(sentence_scores.items(
    ), key=lambda x: x[1], reverse=True)[:sents_in_summary]

    # sorting according to appearance of sentences in the original text
    summarized_sentences = sorted(summarized_sentences, key=lambda x: x[1][1])

    final_sentences = [x[0].text.capitalize() for x in summarized_sentences]
    summary = " ".join(final_sentences)
    return summary
