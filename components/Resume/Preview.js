'use client';

import { useEffect, useRef } from 'react';
import Resume from './Resume'; // Renamed from './pdf' for clarity
import { useSelector } from 'react-redux';
import { CgSpinner } from 'react-icons/cg';
import { usePDF } from '@react-pdf/renderer';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaDownload, FaEye } from 'react-icons/fa6';

// Configure PDF.js worker for rendering PDFs
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

/**
 * Loader component displayed while PDF is loading.
 */
const Loader = () => (
    <div className="flex min-h-96 w-full items-center justify-center">
        <CgSpinner className="mx-auto mt-16 animate-spin text-center text-4xl text-primary-400 md:text-5xl" />
    </div>
);

/**
 * Opens the PDF in a new window for preview.
 * @param {string} url - The URL of the PDF document.
 */
const previewPdf = (url) => {
    // Defines window features for a consistent preview experience
    const windowFeatures = `
        toolbar=no, location=no, menubar=no, scrollbars=yes, status=no, titlebar=no, resizable=yes,
        width=800, height=900,
        left=${window.innerWidth / 2 - 400}, top=50
    `;
    window.open(url, 'Resume Preview', windowFeatures);
};

/**
 * Formats the name for the PDF file download.
 * Ensures an ATS-friendly filename format.
 * @param {string} name - The candidate's name.
 * @returns {string} The formatted filename.
 */
function formatFileName(name) {
    if (!name) return 'Resume';

    const nameParts = name.split(' ').filter(part => part.trim() !== ''); // Clean up name parts
    if (nameParts.length === 0) return 'Resume';

    // Prioritize "FirstName_LastName_Resume" for better ATS parsing
    if (nameParts.length >= 2) {
        return `${nameParts[0]}_${nameParts[nameParts.length - 1]}_Resume`;
    }
    return `${nameParts[0]}_Resume`; // Fallback for single-name entries
}

/**
 * Preview component to display and manage the generated resume PDF.
 */
const Preview = () => {
    const parentRef = useRef(null);
    const resumeData = useSelector((state) => state.resume); // Get resume data from Redux store

    // Create the PDF document component
    const document = <Resume data={resumeData} />;
    // usePDF hook to generate and manage the PDF instance
    const [instance, updateInstance] = usePDF({ document });

    // Update PDF instance whenever resume data is saved
    useEffect(() => {
        if (resumeData.saved) {
            updateInstance(document);
        }
    }, [resumeData.saved, document, updateInstance]); // Added document and updateInstance to dependency array

    const fileName = formatFileName(resumeData.contact?.name);

    return (
        <div ref={parentRef} className="relative w-full md:max-w-[24rem] 2xl:max-w-[28rem] p-4 bg-white rounded-lg shadow-md">
            {instance.loading ? (
                <Loader />
            ) : (
                // Display the PDF using react-pdf's Document and Page components
                <Document loading={<Loader />} file={instance.url}>
                    <Page
                        pageNumber={1}
                        renderTextLayer={false} // Disable text layer for better rendering performance and appearance
                        renderAnnotationLayer={false} // Disable annotation layer
                        loading={<Loader />}
                        width={parentRef.current?.clientWidth || 400} // Ensure a fallback width
                    />
                </Document>
            )}

            {!instance.loading && (
                <div className="mt-4 flex justify-around gap-2">
                    <button
                        onClick={() => previewPdf(instance.url)}
                        className="btn flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                        aria-label="Preview Resume"
                    >
                        <span>Preview</span>
                        <FaEye />
                    </button>
                    <a
                        href={instance.url}
                        download={`${fileName}.pdf`}
                        className="btn flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                        aria-label="Download Resume"
                    >
                        <span>Download</span>
                        <FaDownload />
                    </a>
                </div>
            )}
        </div>
    );
};

export default Preview;
